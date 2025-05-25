import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, Package, User, Calendar, CreditCard, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useOrders, OrderWithDetails } from '../../hooks/useOrders';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, updateOrderStatus } = useOrders();
  
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'pendente' | 'pago' | 'cancelado'>('pendente');
  
  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        setLoading(true);
        const orderData = await getOrder(id);
        if (orderData) {
          setOrder(orderData);
        } else {
          navigate('/admin/orders');
        }
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [id, getOrder, navigate]);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-success-500 bg-opacity-10 text-success-500">
            <CheckCircle size={16} className="mr-2" />
            Pago
          </span>
        );
      case 'pendente':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-warning-500 bg-opacity-10 text-warning-500">
            <Clock size={16} className="mr-2" />
            Pendente
          </span>
        );
      case 'cancelado':
        return (
          <span className="flex items-center px-3 py-1 text-sm rounded-full bg-error-500 bg-opacity-10 text-error-500">
            <XCircle size={16} className="mr-2" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-sm rounded-full bg-krava-gray-700 text-krava-gray-300">
            {status}
          </span>
        );
    }
  };
  
  const handleUpdateStatus = async () => {
    if (id && newStatus) {
      const success = await updateOrderStatus(id, newStatus);
      if (success && order) {
        setOrder({ ...order, status: newStatus });
      }
      setShowStatusModal(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-krava-green"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/orders')}
        >
          Voltar para Pedidos
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
            onClick={() => navigate('/admin/orders')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold">
            Detalhes do Pedido
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowStatusModal(true)}
          >
            Alterar Status
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Resumo do Pedido</h3>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-krava-gray-400 text-sm">ID do Pedido</p>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <p className="text-krava-gray-400 text-sm">Data</p>
                  <p className="font-medium">{formatDate(order.data_criacao)}</p>
                </div>
                <div>
                  <p className="text-krava-gray-400 text-sm">Valor</p>
                  <p className="font-medium">{formatCurrency(order.valor)}</p>
                </div>
                <div>
                  <p className="text-krava-gray-400 text-sm">TXID Pix</p>
                  <p className="font-medium">
                    {order.txid ? order.txid.substring(0, 10) + '...' : 'N/A'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Package size={20} className="text-krava-green mr-2" />
                <h3 className="text-lg font-semibold">Produto</h3>
              </div>
            </CardHeader>
            <CardBody>
              {order.produtos ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.produtos.nome}</p>
                    <div className="flex items-center mt-1">
                      {order.include_order_bump && (
                        <span className="badge-success mr-2">Order Bump</span>
                      )}
                      {order.upsell_accepted && (
                        <span className="badge-success">Upsell</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    as={Link}
                    to={`/admin/products/${order.produto_id}`}
                  >
                    <ExternalLink size={18} className="text-krava-gray-400 hover:text-white" />
                  </Button>
                </div>
              ) : (
                <p className="text-krava-gray-400">Produto não encontrado</p>
              )}
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <User size={20} className="text-krava-green mr-2" />
                <h3 className="text-lg font-semibold">Cliente</h3>
              </div>
            </CardHeader>
            <CardBody>
              {order.usuarios ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.usuarios.nome}</p>
                    <p className="text-krava-gray-400">{order.usuarios.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    as={Link}
                    to={`/admin/customers/${order.usuario_id}`}
                  >
                    <ExternalLink size={18} className="text-krava-gray-400 hover:text-white" />
                  </Button>
                </div>
              ) : (
                <p className="text-krava-gray-400">Cliente não encontrado</p>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Payment Info */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <CreditCard size={20} className="text-krava-green mr-2" />
                <h3 className="text-lg font-semibold">Pagamento</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-krava-gray-400 text-sm">Método</p>
                <p className="font-medium">Pix</p>
              </div>
              
              {order.pix_qr_code && (
                <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                  <img 
                    src={order.pix_qr_code} 
                    alt="QR Code Pix" 
                    className="max-w-full h-auto"
                  />
                </div>
              )}
              
              {order.pix_copia_cola && (
                <div>
                  <p className="text-krava-gray-400 text-sm mb-1">Pix Copia e Cola</p>
                  <div className="bg-krava-gray-800 p-3 rounded-md text-xs overflow-hidden break-all">
                    {order.pix_copia_cola}
                  </div>
                </div>
              )}
              
              <div className="pt-3">
                <p className="text-krava-gray-400 text-sm">Status</p>
                <div className="mt-1">
                  {getStatusBadge(order.status)}
                </div>
              </div>
              
              <div className="pt-3">
                <p className="text-krava-gray-400 text-sm">Data de Pagamento</p>
                <p className="font-medium">
                  {order.status === 'pago'
                    ? formatDate(order.updated_at)
                    : 'Aguardando pagamento'}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-krava-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
            <h3 className="text-xl font-bold">Alterar Status do Pedido</h3>
            
            <div>
              <label htmlFor="status" className="label">
                Novo Status
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="select"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowStatusModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdateStatus}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;