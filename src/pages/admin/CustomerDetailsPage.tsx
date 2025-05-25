import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Edit, 
  Save, 
  ShoppingBag,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useCustomers, CustomerWithOrders } from '../../hooks/useCustomers';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, updateCustomer } = useCustomers();
  
  const [customer, setCustomer] = useState<CustomerWithOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });
  
  useEffect(() => {
    const loadCustomer = async () => {
      if (id) {
        setLoading(true);
        const customerData = await getCustomer(id);
        if (customerData) {
          setCustomer(customerData);
          setFormData({
            nome: customerData.nome,
            email: customerData.email,
            telefone: customerData.telefone || '',
            cpf: customerData.cpf || '',
          });
        } else {
          navigate('/admin/customers');
        }
        setLoading(false);
      }
    };
    
    loadCustomer();
  }, [id, getCustomer, navigate]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-success-500 bg-opacity-10 text-success-500">
            <CheckCircle size={12} className="mr-1" />
            Pago
          </span>
        );
      case 'pendente':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-warning-500 bg-opacity-10 text-warning-500">
            <Clock size={12} className="mr-1" />
            Pendente
          </span>
        );
      case 'cancelado':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-error-500 bg-opacity-10 text-error-500">
            <XCircle size={12} className="mr-1" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-krava-gray-700 text-krava-gray-300">
            {status}
          </span>
        );
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (id) {
      const success = await updateCustomer(id, formData);
      if (success && customer) {
        setCustomer({
          ...customer,
          ...formData,
        });
        setIsEditing(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-krava-green"></div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Cliente não encontrado</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/customers')}
        >
          Voltar para Clientes
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/customers')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold">
            Detalhes do Cliente
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                leftIcon={<Save size={18} />}
                onClick={handleSubmit}
              >
                Salvar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              leftIcon={<Edit size={18} />}
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <User size={20} className="text-krava-green mr-2" />
                <h3 className="text-lg font-semibold">Informações do Cliente</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {isEditing ? (
                <form className="space-y-4">
                  <Input
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    leftIcon={<User size={18} />}
                  />
                  
                  <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    leftIcon={<Mail size={18} />}
                  />
                  
                  <Input
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    leftIcon={<Phone size={18} />}
                  />
                  
                  <Input
                    label="CPF"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    leftIcon={<CreditCard size={18} />}
                  />
                </form>
              ) : (
                <>
                  <div>
                    <div className="flex items-center mb-1">
                      <User size={18} className="text-krava-gray-400 mr-2" />
                      <p className="text-krava-gray-400 text-sm">Nome</p>
                    </div>
                    <p className="font-medium pl-7">{customer.nome}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <Mail size={18} className="text-krava-gray-400 mr-2" />
                      <p className="text-krava-gray-400 text-sm">E-mail</p>
                    </div>
                    <p className="font-medium pl-7">{customer.email}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <Phone size={18} className="text-krava-gray-400 mr-2" />
                      <p className="text-krava-gray-400 text-sm">Telefone</p>
                    </div>
                    <p className="font-medium pl-7">
                      {customer.telefone || 'Não informado'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <CreditCard size={18} className="text-krava-gray-400 mr-2" />
                      <p className="text-krava-gray-400 text-sm">CPF</p>
                    </div>
                    <p className="font-medium pl-7">
                      {customer.cpf || 'Não informado'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <Clock size={18} className="text-krava-gray-400 mr-2" />
                      <p className="text-krava-gray-400 text-sm">Cliente desde</p>
                    </div>
                    <p className="font-medium pl-7">
                      {formatDate(customer.created_at)}
                    </p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Customer Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <ShoppingBag size={20} className="text-krava-green mr-2" />
                <h3 className="text-lg font-semibold">Pedidos do Cliente</h3>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-krava-gray-800">
                <thead className="bg-krava-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                      ID / Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-krava-gray-900 divide-y divide-krava-gray-800">
                  {customer.pedidos && customer.pedidos.length > 0 ? (
                    customer.pedidos.map((order) => (
                      <tr key={order.id} className="hover:bg-krava-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {order.id.substring(0, 8)}...
                            </div>
                            <div className="text-sm text-krava-gray-400">
                              {order.produtos?.nome || 'Produto não encontrado'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-krava-gray-300">
                          {formatDate(order.data_criacao)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatCurrency(order.valor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Ver detalhes"
                            title="Ver detalhes"
                            as={Link}
                            to={`/admin/orders/${order.id}`}
                          >
                            <ExternalLink size={18} className="text-krava-gray-400 hover:text-white" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-krava-gray-400">
                        Este cliente ainda não realizou nenhum pedido
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;