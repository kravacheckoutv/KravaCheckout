export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      produtos: {
        Row: {
          id: string
          nome: string
          slug: string
          descricao: string
          valor: number
          tipo: 'produto único' | 'assinatura'
          status: 'ativo' | 'inativo'
          imagem: string | null
          config_checkout: {
            cor_primaria: string
            banner: string | null
            texto_chamada: string
            campos_personalizados: Array<{
              nome: string
              tipo: 'texto' | 'email' | 'telefone' | 'cpf'
              obrigatorio: boolean
            }>
          } | null
          upsell_produto_id: string | null
          order_bump_produto_id: string | null
          forma_entrega: 'link' | 'arquivo' | 'área de membros'
          entrega_conteudo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          descricao: string
          valor: number
          tipo: 'produto único' | 'assinatura'
          status: 'ativo' | 'inativo'
          imagem?: string | null
          config_checkout?: {
            cor_primaria: string
            banner: string | null
            texto_chamada: string
            campos_personalizados: Array<{
              nome: string
              tipo: 'texto' | 'email' | 'telefone' | 'cpf'
              obrigatorio: boolean
            }>
          } | null
          upsell_produto_id?: string | null
          order_bump_produto_id?: string | null
          forma_entrega: 'link' | 'arquivo' | 'área de membros'
          entrega_conteudo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          descricao?: string
          valor?: number
          tipo?: 'produto único' | 'assinatura'
          status?: 'ativo' | 'inativo'
          imagem?: string | null
          config_checkout?: {
            cor_primaria: string
            banner: string | null
            texto_chamada: string
            campos_personalizados: Array<{
              nome: string
              tipo: 'texto' | 'email' | 'telefone' | 'cpf'
              obrigatorio: boolean
            }>
          } | null
          upsell_produto_id?: string | null
          order_bump_produto_id?: string | null
          forma_entrega?: 'link' | 'arquivo' | 'área de membros'
          entrega_conteudo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          cpf: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          telefone?: string | null
          cpf?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          cpf?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          usuario_id: string
          produto_id: string
          valor: number
          status: 'pendente' | 'pago' | 'cancelado'
          pix_qr_code: string | null
          pix_copia_cola: string | null
          txid: string | null
          data_criacao: string
          updated_at: string
          include_order_bump: boolean
          upsell_accepted: boolean
        }
        Insert: {
          id?: string
          usuario_id: string
          produto_id: string
          valor: number
          status: 'pendente' | 'pago' | 'cancelado'
          pix_qr_code?: string | null
          pix_copia_cola?: string | null
          txid?: string | null
          data_criacao?: string
          updated_at?: string
          include_order_bump?: boolean
          upsell_accepted?: boolean
        }
        Update: {
          id?: string
          usuario_id?: string
          produto_id?: string
          valor?: number
          status?: 'pendente' | 'pago' | 'cancelado'
          pix_qr_code?: string | null
          pix_copia_cola?: string | null
          txid?: string | null
          data_criacao?: string
          updated_at?: string
          include_order_bump?: boolean
          upsell_accepted?: boolean
        }
      }
      assinaturas: {
        Row: {
          id: string
          usuario_id: string
          produto_id: string
          status: 'ativa' | 'inativa' | 'cancelada'
          inicio: string
          proximo_pagamento: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          produto_id: string
          status: 'ativa' | 'inativa' | 'cancelada'
          inicio: string
          proximo_pagamento: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          produto_id?: string
          status?: 'ativa' | 'inativa' | 'cancelada'
          inicio?: string
          proximo_pagamento?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}