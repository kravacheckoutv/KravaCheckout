import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await signUp(email, password, {
        nome,
        telefone
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Registro realizado com sucesso!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nome"
        type="text"
        id="nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu Nome"
        required
        leftIcon={<User size={18} />}
      />
      
      <Input
        label="E-mail"
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        leftIcon={<Mail size={18} />}
      />
      
      <Input
        label="Telefone"
        type="tel"
        id="telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="(00) 00000-0000"
        leftIcon={<Phone size={18} />}
      />
      
      <Input
        label="Senha"
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        leftIcon={<Lock size={18} />}
      />
      
      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          Criar Conta
        </Button>
      </div>
      
      <div className="text-center text-sm">
        <p className="text-krava-gray-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-krava-green hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterPage;