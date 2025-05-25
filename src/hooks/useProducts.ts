import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/supabase-client';
import { Database } from '../lib/supabase/supabase-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export type Product = Database['public']['Tables']['produtos']['Row'];
export type ProductInsert = Database['public']['Tables']['produtos']['Insert'];
export type ProductUpdate = Database['public']['Tables']['produtos']['Update'];

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      toast.error('Erro ao carregar produto');
      return null;
    }
  };

  const getProductBySlug = async (slug: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'ativo')
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Erro ao carregar produto por slug:', err);
      return null;
    }
  };

  const createProduct = async (product: ProductInsert): Promise<string | null> => {
    try {
      // Generate slug if not provided
      if (!product.slug) {
        product.slug = product.nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
      }

      // Set default values for config_checkout if not provided
      if (!product.config_checkout) {
        product.config_checkout = {
          cor_primaria: '#00ff2a',
          banner: null,
          texto_chamada: 'Adquira este produto agora!',
          campos_personalizados: [
            { nome: 'Nome', tipo: 'texto', obrigatorio: true },
            { nome: 'E-mail', tipo: 'email', obrigatorio: true },
          ]
        };
      }

      const { data, error } = await supabase
        .from('produtos')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Produto criado com sucesso!');
      return data?.id || null;
    } catch (err: any) {
      toast.error('Erro ao criar produto');
      setError(err.message);
      return null;
    }
  };

  const updateProduct = async (id: string, product: ProductUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update(product)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Produto atualizado com sucesso!');
      return true;
    } catch (err: any) {
      toast.error('Erro ao atualizar produto');
      setError(err.message);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      // Check if product has any orders before deleting
      const { data: orders, error: ordersError } = await supabase
        .from('pedidos')
        .select('id')
        .eq('produto_id', id)
        .limit(1);

      if (ordersError) throw ordersError;
      
      if (orders && orders.length > 0) {
        toast.error('Não é possível excluir um produto com pedidos associados');
        return false;
      }

      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Produto excluído com sucesso!');
      return true;
    } catch (err: any) {
      toast.error('Erro ao excluir produto');
      setError(err.message);
      return false;
    }
  };

  const handleCreateProduct = async (product: ProductInsert) => {
    const id = await createProduct(product);
    if (id) {
      navigate(`/admin/products/${id}`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    getProductBySlug,
    createProduct: handleCreateProduct,
    updateProduct,
    deleteProduct,
  };
};