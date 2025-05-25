import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Package, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useProducts } from '../../hooks/useProducts';

const ProductsPage: React.FC = () => {
  const { products, loading, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const filteredProducts = products.filter(product => 
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) {
      setShowDeleteModal(null);
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleNewProduct = () => {
    navigate('/admin/products/new');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button 
          variant="primary" 
          leftIcon={<Plus size={18} />}
          onClick={handleNewProduct}
        >
          Novo Produto
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-semibold">Lista de Produtos</h2>
            <div className="w-full md:w-64">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-krava-gray-800">
            <thead className="bg-krava-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-krava-gray-400 uppercase tracking-wider">
                  Entrega
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
                    Carregando produtos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-krava-gray-400">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-krava-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-krava-gray-800 rounded-md flex items-center justify-center">
                          {product.imagem ? (
                            <img 
                              src={product.imagem} 
                              alt={product.nome}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <Package size={20} className="text-krava-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{product.nome}</div>
                          <div className="text-sm text-krava-gray-400">
                            {product.descricao.length > 50 
                              ? `${product.descricao.slice(0, 50)}...` 
                              : product.descricao
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(product.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {product.tipo === 'produto único' ? 'Único' : 'Assinatura'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'ativo' 
                          ? 'bg-success-500 bg-opacity-10 text-success-500' 
                          : 'bg-krava-gray-700 text-krava-gray-300'
                      }`}>
                        {product.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white capitalize">
                      {product.forma_entrega}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Link do checkout"
                          title="Link do checkout"
                          href={`/checkout/${product.slug}`}
                          target="_blank"
                        >
                          <ExternalLink size={18} className="text-krava-gray-400 hover:text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Editar"
                          title="Editar"
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                        >
                          <Edit size={18} className="text-krava-gray-400 hover:text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Excluir"
                          title="Excluir"
                          onClick={() => setShowDeleteModal(product.id)}
                        >
                          <Trash2 size={18} className="text-krava-gray-400 hover:text-error-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-krava-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
            <h3 className="text-xl font-bold">Confirmar exclusão</h3>
            <p className="text-krava-gray-300">
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDelete(showDeleteModal)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;