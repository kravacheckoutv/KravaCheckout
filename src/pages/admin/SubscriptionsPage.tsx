import React, { useState } from 'react';
import { Search, Calendar, User, Package, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SubscriptionsPage: React.FC = () => {
  const { subscriptions, loading, updateSubscriptionStatus } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<'ativa' | 'inativa' | 'cancelada'>('ativa');
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-success-500 bg-opacity-10 text-success-500">
            <CheckCircle2 size={12} className="mr-1" />
            Ativa
          </span>
        );
      case 'inativa':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-warning-500 bg-opacity-10 text-warning-500">
            <Calendar size={12} className="mr-1" />
            Inativa
          </span>
        );
      case 'cancelada':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-error-500 bg-opacity-10 text-error-500">
            <XCircle size={12} className="mr-1" />
            Cancelada
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
  
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (subscription.usuarios?.nome && subscription.usuarios.nome.toLowerCase().includes(searchLower)) ||
      (subscription.usuarios?.email && subscription.usuarios.email.toLowerCase().includes(searchLower)) ||
      (subscription.produtos?.nome && subscription.produtos.nome.toLowerCase().includes(searchLower))
    );
  });
  
  const handleUpdateStatus = async () => {
    if (showStatusModal && newStatus) {
      const success = await updateSubscriptionStatus(showStatusModal, newStatus);
      if (success) {
        setShowStatusModal(null);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Assinaturas</h1>
        
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar assinaturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lista de Assinaturas</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-krava-gray-400">
                {filteredSubscriptions.length} assinaturas
              </span>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-krava-gray-800">
            <thead className="bg-krava-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Próximo Pagamento
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
                  <td colSpan={7} className="px-6 py-4 text-center text-krava-gray-400">
                    Carregando assinaturas...
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-krava-gray-400">
                    Nenhuma assinatura encontrada
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-krava-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-krava-gray-800 rounded-full flex items-center justify-center">
                          <User size={16} className="text-krava-gray-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">
                            {subscription.usuarios?.nome || 'Cliente não encontrado'}
                          </div>
                          <div className="text-xs text-krava-gray-400">
                            {subscription.usuarios?.email || 'Email não disponível'}
                          </div>
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
                            {subscription.produtos?.nome || 'Produto não encontrado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {subscription.produtos?.valor 
                        ? formatCurrency(subscription.produtos.valor) 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-krava-gray-300">
                      {formatDate(subscription.inicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-krava-gray-300">
                      {formatDate(subscription.proximo_pagamento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowStatusModal(subscription.id);
                          setNewStatus(subscription.status);
                        }}
                      >
                        Alterar Status
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-krava-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
            <h3 className="text-xl font-bold">Alterar Status da Assinatura</h3>
            
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
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowStatusModal(null)}
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

export default SubscriptionsPage;