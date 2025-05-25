import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/supabase-client';
import { Database } from '../lib/supabase/supabase-types';
import toast from 'react-hot-toast';

export type Customer = Database['public']['Tables']['usuarios']['Row'];
export type CustomerInsert = Database['public']['Tables']['usuarios']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['usuarios']['Update'];

export type CustomerWithOrders = Customer & {
  pedidos: Array<{
    id: string;
    valor: number;
    status: string;
    data_criacao: string;
    produto_id: string;
    produtos: {
      nome: string;
    };
  }>;
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const getCustomer = async (id: string): Promise<CustomerWithOrders | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          pedidos (
            id,
            valor,
            status,
            data_criacao,
            produto_id,
            produtos (
              nome
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CustomerWithOrders;
    } catch (err: any) {
      toast.error('Erro ao carregar cliente');
      return null;
    }
  };

  const createCustomer = async (customer: CustomerInsert): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Cliente criado com sucesso!');
      return data?.id || null;
    } catch (err: any) {
      toast.error('Erro ao criar cliente');
      return null;
    }
  };

  const updateCustomer = async (id: string, customer: CustomerUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(customer)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Cliente atualizado com sucesso!');
      return true;
    } catch (err: any) {
      toast.error('Erro ao atualizar cliente');
      return false;
    }
  };

  const findOrCreateCustomer = async (
    email: string, 
    customerData: { nome: string; telefone?: string; cpf?: string }
  ): Promise<string> => {
    try {
      // Try to find existing customer by email
      const { data: existingCustomer, error: findError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingCustomer) {
        // Update customer data in case there's new information
        await updateCustomer(existingCustomer.id, {
          nome: customerData.nome,
          telefone: customerData.telefone || null,
          cpf: customerData.cpf || null
        });
        
        return existingCustomer.id;
      }
      
      // If customer doesn't exist, create a new one
      const { data: newCustomer, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: crypto.randomUUID(),
          nome: customerData.nome,
          email: email,
          telefone: customerData.telefone || null,
          cpf: customerData.cpf || null
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      return newCustomer.id;
    } catch (err: any) {
      console.error('Error finding or creating customer:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    findOrCreateCustomer
  };
};