/*
  # Initial Database Schema for Krava System

  1. New Tables
    - `produtos` - Stores product information
    - `usuarios` - Stores customer information
    - `pedidos` - Stores order information
    - `assinaturas` - Stores subscription information

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for CRUD operations
*/

-- Create the produtos table
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text UNIQUE NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('produto único', 'assinatura')),
  status text NOT NULL CHECK (status IN ('ativo', 'inativo')),
  imagem text,
  config_checkout jsonb,
  upsell_produto_id uuid REFERENCES produtos(id),
  order_bump_produto_id uuid REFERENCES produtos(id),
  forma_entrega text NOT NULL CHECK (forma_entrega IN ('link', 'arquivo', 'área de membros')),
  entrega_conteudo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefone text,
  cpf text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  produto_id uuid NOT NULL REFERENCES produtos(id),
  valor numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('pendente', 'pago', 'cancelado')),
  pix_qr_code text,
  pix_copia_cola text,
  txid text,
  include_order_bump boolean DEFAULT false,
  upsell_accepted boolean DEFAULT false,
  data_criacao timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the assinaturas table
CREATE TABLE IF NOT EXISTS assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  produto_id uuid NOT NULL REFERENCES produtos(id),
  status text NOT NULL CHECK (status IN ('ativa', 'inativa', 'cancelada')),
  inicio timestamptz NOT NULL,
  proximo_pagamento timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;

-- Create policies for produtos
CREATE POLICY "Authenticated users can read all active products" 
  ON produtos FOR SELECT 
  USING (status = 'ativo' OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create products" 
  ON produtos FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their products" 
  ON produtos FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete their products" 
  ON produtos FOR DELETE 
  TO authenticated 
  USING (true);

-- Create policies for usuarios
CREATE POLICY "Users can read their own data" 
  ON usuarios FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own data" 
  ON usuarios FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON usuarios FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Create policies for pedidos
CREATE POLICY "Authenticated users can read orders" 
  ON pedidos FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can create orders" 
  ON pedidos FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders" 
  ON pedidos FOR UPDATE 
  TO authenticated 
  USING (true);

-- Create policies for assinaturas
CREATE POLICY "Authenticated users can read subscriptions" 
  ON assinaturas FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can create subscriptions" 
  ON assinaturas FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subscriptions" 
  ON assinaturas FOR UPDATE 
  TO authenticated 
  USING (true);

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_produtos
BEFORE UPDATE ON produtos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_pedidos
BEFORE UPDATE ON pedidos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_assinaturas
BEFORE UPDATE ON assinaturas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();