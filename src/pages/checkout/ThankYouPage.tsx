import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, FileDown, ExternalLink, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { useProducts } from '../../hooks/useProducts';
import Logo from '../../components/ui/Logo';

const ThankYouPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProductBySlug } = useProducts();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadProduct = async () => {
      if (slug) {
        const productData = await getProductBySlug(slug);
        if (productData) {
          setProduct(productData);
        } else {
          navigate('/');
        }
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [slug, getProductBySlug, navigate]);
  
  const handleDownload = () => {
    if (product?.entrega_conteudo && product.forma_entrega === 'arquivo') {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = product.entrega_conteudo;
      link.download = `${product.nome}.pdf`; // Use a better filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-krava-green mb-4"></div>
        <p className="text-krava-gray-300">Carregando...</p>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
        <p className="text-krava-gray-300 mb-6">
          O produto que você está procurando não existe ou está inativo.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
        >
          Voltar para o início
        </Button>
      </div>
    );
  }
  
  // Define theme color based on product config
  const themeColor = product.config_checkout?.cor_primaria || '#00ff2a';
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center h-20 w-20 rounded-full mb-6"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <CheckCircle size={40} style={{ color: themeColor }} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Obrigado pela sua compra!</h1>
          <p className="text-xl text-krava-gray-300">
            Seu pagamento foi confirmado e seu produto já está disponível.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardBody className="p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Detalhes do Produto</h2>
                <div className="bg-krava-gray-800 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-krava-gray-700 rounded-md flex items-center justify-center">
                    {product.imagem ? (
                      <img 
                        src={product.imagem} 
                        alt={product.nome} 
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="text-krava-gray-500 text-2xl font-bold">
                        {product.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-semibold">{product.nome}</h3>
                    <p className="text-krava-gray-400 text-sm">
                      {product.descricao.length > 100
                        ? `${product.descricao.slice(0, 100)}...`
                        : product.descricao}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">Acesse seu produto</h2>
                
                {product.forma_entrega === 'link' && product.entrega_conteudo && (
                  <Button
                    variant="primary"
                    fullWidth
                    style={{ backgroundColor: themeColor }}
                    size="lg"
                    rightIcon={<ExternalLink size={20} />}
                    href={product.entrega_conteudo}
                    target="_blank"
                  >
                    Acessar Produto
                  </Button>
                )}
                
                {product.forma_entrega === 'arquivo' && product.entrega_conteudo && (
                  <Button
                    variant="primary"
                    fullWidth
                    style={{ backgroundColor: themeColor }}
                    size="lg"
                    rightIcon={<FileDown size={20} />}
                    onClick={handleDownload}
                  >
                    Baixar Produto
                  </Button>
                )}
                
                {product.forma_entrega === 'área de membros' && (
                  <div className="bg-krava-gray-800 rounded-lg p-6 text-center">
                    <p className="text-krava-gray-300 mb-4">
                      Você receberá um e-mail com as instruções para acessar a área de membros.
                    </p>
                    <Button
                      variant="primary"
                      style={{ backgroundColor: themeColor }}
                      size="lg"
                      disabled
                    >
                      Área de Membros (Em breve)
                    </Button>
                  </div>
                )}
                
                <div className="mt-8 text-center text-krava-gray-400 text-sm">
                  <p className="mb-2">Você também receberá essas informações por e-mail.</p>
                  <p>Em caso de dúvidas, entre em contato com nosso suporte.</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/')}
          >
            Voltar ao início
          </Button>
          
          <Logo size="sm" />
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;