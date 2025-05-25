import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, User, Mail, Phone } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useCustomers } from '../../hooks/useCustomers';

const CustomersPage: React.FC = () => {
  const { customers, loading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.nome.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.telefone && customer.telefone.toLowerCase().includes(searchLower)) ||
      (customer.cpf && customer.cpf.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Clientes</h1>
        
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lista de Clientes</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-krava-gray-400">
                {filteredCustomers.length} clientes
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
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-krava-gray-900 divide-y divide-krava-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-krava-gray-400">
                    Carregando clientes...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-krava-gray-400">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-krava-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-krava-gray-800 rounded-full flex items-center justify-center">
                          <User size={20} className="text-krava-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{customer.nome}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-krava-gray-300">
                        <Mail size={16} className="mr-2 text-krava-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-krava-gray-300">
                      {customer.telefone ? (
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2 text-krava-gray-400" />
                          {customer.telefone}
                        </div>
                      ) : (
                        <span className="text-krava-gray-500">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-krava-gray-300">
                      {customer.cpf || (
                        <span className="text-krava-gray-500">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Ver detalhes"
                        title="Ver detalhes"
                        as={Link}
                        to={`/admin/customers/${customer.id}`}
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
    </div>
  );
};

export default CustomersPage;