import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/supabase-client';
import { Database } from '../lib/supabase/supabase-types';
import toast from 'react-hot-toast';

export type Subscription = Database['public']['Tables']['assinaturas']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['assinaturas']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['assinaturas']['Update'];

export type SubscriptionWithDetails = Subscription & {
  produtos: {
    nome: string;
    valor: number;
  };
  usuarios: {
    nome: string;
    email: string;
  };
};

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assinaturas')
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data as SubscriptionWithDetails[] || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  const getSubscription = async (id: string): Promise<SubscriptionWithDetails | null> => {
    try {
      const { data, error } = await supabase
        .from('assinaturas')
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
      return data as SubscriptionWithDetails;
    } catch (err: any) {
      toast.error('Erro ao carregar assinatura');
      return null;
    }
  };

  const createSubscription = async (subscription: SubscriptionInsert): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('assinaturas')
        .insert(subscription)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Assinatura criada com sucesso!');
      return data?.id || null;
    } catch (err: any) {
      toast.error('Erro ao criar assinatura');
      return null;
    }
  };

  const updateSubscriptionStatus = async (
    id: string, 
    status: 'ativa' | 'inativa' | 'cancelada'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assinaturas')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Status da assinatura atualizado com sucesso!');
      return true;
    } catch (err: any) {
      toast.error('Erro ao atualizar status da assinatura');
      return false;
    }
  };

  const updateNextPaymentDate = async (id: string, nextDate: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assinaturas')
        .update({ 
          proximo_pagamento: nextDate, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Data do próximo pagamento atualizada com sucesso!');
      return true;
    } catch (err: any) {
      toast.error('Erro ao atualizar data do próximo pagamento');
      return false;
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    getSubscription,
    createSubscription,
    updateSubscriptionStatus,
    updateNextPaymentDate
  };
};