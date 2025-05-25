import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Calendar, 
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OrdersPage: React.FC = () => {
  const { orders, loading, filters, updateFilters } = useOrders();
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status badge
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
  
  // Apply search filter
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.usuarios?.nome && order.usuarios.nome.toLowerCase().includes(searchLower)) ||
      (order.usuarios?.email && order.usuarios.email.toLowerCase().includes(searchLower)) ||
      (order.produtos?.nome && order.produtos.nome.toLowerCase().includes(searchLower)) ||
      order.id.toLowerCase().includes(searchLower)
    );
  });
  
  // Reset filters
  const resetFilters = () => {
    updateFilters({
      status: 'all',
      productId: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: ''
    });
    setShowFilterModal(false);
  };
  
  // Apply filters
  const applyFilters = () => {
    setShowFilterModal(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          
          <Button
            variant="outline"
            leftIcon={<Filter size={18} />}
            onClick={() => setShowFilterModal(true)}
          >
            Filtros
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lista de Pedidos</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-krava-gray-400">
                {filteredOrders.length} pedidos
              </span>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-krava-gray-800">
            <thead className="bg-krava-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  ID / Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Produto
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-krava-gray-400">
                    Carregando pedidos...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-krava-gray-400">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-krava-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {order.id.substring(0, 8)}...
                        </div>
                        <div className="text-sm text-krava-gray-400">
                          {order.usuarios?.nome || 'Cliente não encontrado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-krava-gray-800 rounded-md flex items-center justify-center">
                          <Package size={16} className="text-krava-gray-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">
                            {order.produtos?.nome || 'Produto não encontrado'}
                          </div>
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
                        <Eye size={18} className="text-krava-gray-400 hover:text-white" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-krava-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Filtros</h3>
              <button
                className="text-krava-gray-400 hover:text-white"
                onClick={() => setShowFilterModal(false)}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="status-filter" className="label">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="select"
                >
                  <option value="all">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="product-filter" className="label">
                  Produto
                </label>
                <select
                  id="product-filter"
                  value={filters.productId}
                  onChange={(e) => updateFilters({ productId: e.target.value })}
                  className="select"
                >
                  <option value="all">Todos os produtos</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date-range-filter" className="label">
                  Período
                </label>
                <select
                  id="date-range-filter"
                  value={filters.dateRange}
                  onChange={(e) => updateFilters({ dateRange: e.target.value })}
                  className="select"
                >
                  <option value="all">Todo período</option>
                  <option value="today">Hoje</option>
                  <option value="last7days">Últimos 7 dias</option>
                  <option value="last30days">Últimos 30 dias</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              
              {filters.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-date" className="label">
                      Data inicial
                    </label>
                    <Input
                      id="start-date"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => updateFilters({ startDate: e.target.value })}
                      leftIcon={<Calendar size={18} />}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end-date" className="label">
                      Data final
                    </label>
                    <Input
                      id="end-date"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => updateFilters({ endDate: e.target.value })}
                      leftIcon={<Calendar size={18} />}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetFilters}>
                Limpar
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;