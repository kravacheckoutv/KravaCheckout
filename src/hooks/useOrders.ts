import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/supabase-client';
import { Database } from '../lib/supabase/supabase-types';
import toast from 'react-hot-toast';
import { createPixCharge, pollPaymentStatus } from '../lib/api/pushInPayApi';
import { v4 as uuidv4 } from 'uuid';

export type Order = Database['public']['Tables']['pedidos']['Row'];
export type OrderInsert = Database['public']['Tables']['pedidos']['Insert'];
export type OrderUpdate = Database['public']['Tables']['pedidos']['Update'];

export type OrderWithDetails = Order & {
  produtos: {
    nome: string;
    valor: number;
  };
  usuarios: {
    nome: string;
    email: string;
  };
};

interface CreateOrderParams {
  usuario_id: string;
  produto_id: string;
  valor: number;
  includeOrderBump?: boolean;
  customerData: {
    name: string;
    email: string;
    tax_id?: string;
    phone?: string;
  };
  productName: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    productId: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          produtos (
            nome,
            valor
          ),
          usuarios (
            nome,
            email
          )
        `)
        .order('data_criacao', { ascending: false });
      
      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.productId !== 'all') {
        query = query.eq('produto_id', filters.productId);
      }
      
      if (filters.dateRange === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('data_criacao', today);
      } else if (filters.dateRange === 'last7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('data_criacao', sevenDaysAgo.toISOString());
      } else if (filters.dateRange === 'last30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('data_criacao', thirtyDaysAgo.toISOString());
      } else if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
        query = query
          .gte('data_criacao', filters.startDate)
          .lte('data_criacao', filters.endDate);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setOrders(data as OrderWithDetails[] || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (id: string): Promise<OrderWithDetails | null> => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          produtos (
            *
          ),
          usuarios (
            *
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as OrderWithDetails;
    } catch (err: any) {
      toast.error('Erro ao carregar pedido');
      return null;
    }
  };

  const createOrder = async ({
    usuario_id,
    produto_id,
    valor,
    includeOrderBump = false,
    customerData,
    productName
  }: CreateOrderParams): Promise<{ order: Order | null; pixData: any | null }> => {
    try {
      // First create a reference ID for the order
      const referenceId = uuidv4();
      
      // Create the PIX charge through Push In Pay API
      const pixResponse = await createPixCharge({
        reference_id: referenceId,
        customer: {
          name: customerData.name,
          email: customerData.email,
          tax_id: customerData.tax_id,
          phone: customerData.phone
        },
        items: [
          {
            name: productName,
            quantity: 1,
            unit_amount: valor * 100 // Convert to cents
          }
        ],
        amount: {
          value: valor * 100 // Convert to cents
        },
        description: `Pagamento para ${productName}`,
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      });
      
      // Now create the order in our database
      const orderData: OrderInsert = {
        usuario_id,
        produto_id,
        valor,
        status: 'pendente',
        pix_qr_code: pixResponse.qr_code.image,
        pix_copia_cola: pixResponse.qr_code.text,
        txid: pixResponse.txid,
        include_order_bump: includeOrderBump,
        upsell_accepted: false
      };
      
      const { data, error } = await supabase
        .from('pedidos')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      
      return { 
        order: data, 
        pixData: {
          qrCode: pixResponse.qr_code.image,
          copiaECola: pixResponse.qr_code.text,
          txid: pixResponse.txid
        } 
      };
    } catch (err: any) {
      toast.error('Erro ao criar pedido');
      setError(err.message);
      return { order: null, pixData: null };
    }
  };

  const updateOrderStatus = async (id: string, status: 'pendente' | 'pago' | 'cancelado'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      toast.error('Erro ao atualizar status do pedido');
      return false;
    }
  };

  const acceptUpsell = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ upsell_accepted: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      toast.error('Erro ao aceitar upsell');
      return false;
    }
  };

  const startPaymentPolling = (txid: string, orderId: string) => {
    return pollPaymentStatus(
      txid,
      async (status) => {
        if (status === 'PAID') {
          await updateOrderStatus(orderId, 'pago');
          toast.success('Pagamento confirmado!');
        } else if (status === 'EXPIRED') {
          await updateOrderStatus(orderId, 'cancelado');
          toast.error('Pagamento expirou');
        } else if (status === 'TIMEOUT') {
          toast.error('Tempo excedido ao verificar pagamento');
        }
      }
    );
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  return {
    orders,
    loading,
    error,
    filters,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    acceptUpsell,
    startPaymentPolling,
    updateFilters
  };
};