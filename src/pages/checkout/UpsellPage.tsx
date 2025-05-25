import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import Logo from '../../components/ui/Logo';

const UpsellPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProductBySlug } = useProducts();
  const { getOrder, acceptUpsell } = useOrders();
  
  const [mainProduct, setMainProduct] = useState<any>(null);
  const [upsellProduct, setUpsellProduct] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (slug) {
        try {
          // Get the main product
          const product = await getProductBySlug(slug);
          if (product) {
            setMainProduct(product);
            
            // Get the upsell product if available
            if (product.upsell_produto_id) {
              const upsell = await getProductBySlug(product.upsell_produto_id);
              if (upsell) {
                setUpsellProduct(upsell);
              }
            }
            
            // TODO: In a real implementation, we would get the orderId from URL params or session storage
            // For now, we'll just fake it
            setOrderId('123');
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error loading upsell data:', error);
          navigate('/');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [slug, getProductBySlug, getOrder, navigate]);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const handleAcceptUpsell = async () => {
    if (orderId) {
      await acceptUpsell(orderId);
      
      // In a real implementation, this would create a new order for the upsell product
      // and then redirect to payment or thank you page
      navigate(`/checkout/${slug}/thank-you`);
    }
  };
  
  const handleDeclineUpsell = () => {
    navigate(`/checkout/${slug}/thank-you`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-krava-green mb-4"></div>
        <p className="text-krava-gray-300">Carregando...</p>
      </div>
    );
  }
  
  if (!upsellProduct) {
    // If there's no upsell product, redirect to thank you page
    navigate(`/checkout/${slug}/thank-you`);
    return null;
  }
  
  // Define theme color based on product config
  const themeColor = mainProduct?.config_checkout?.cor_primaria || '#00ff2a';
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success-500 bg-opacity-10 mb-4">
            <Check size={32} className="text-success-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h1>
          <p className="text-krava-gray-300">
            Seu pedido foi processado com sucesso. Temos uma oferta especial para você!
          </p>
        </div>
        
        <Card className="mb-8">
          <CardBody className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>
                  Oferta Especial!
                </h2>
                <p className="text-krava-gray-300">
                  Aproveite esta oportunidade única disponível apenas agora:
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-6 py-4">
                {upsellProduct.imagem ? (
                  <div className="w-full md:w-1/3">
                    <img 
                      src={upsellProduct.imagem} 
                      alt={upsellProduct.nome} 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-1/3 aspect-video bg-krava-gray-800 rounded-lg flex items-center justify-center">
                    <Package size={48} className="text-krava-gray-600" />
                  </div>
                )}
                
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-bold mb-2">{upsellProduct.nome}</h3>
                  <p className="text-krava-gray-300 mb-4">
                    {upsellProduct.descricao}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold" style={{ color: themeColor }}>
                      {formatCurrency(upsellProduct.valor)}
                    </span>
                    {/* Uncomment if there's a discount
                    <span className="text-krava-gray-400 line-through">
                      {formatCurrency(upsellProduct.valor * 1.3)}
                    </span>
                    */}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    style={{ backgroundColor: themeColor }}
                    size="lg"
                    rightIcon={<ArrowRight size={20} />}
                    onClick={handleAcceptUpsell}
                  >
                    Sim, Quero Aproveitar Esta Oferta!
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleDeclineUpsell}
                  >
                    Não, obrigado
                  </Button>
                </div>
                
                <div className="text-center text-krava-gray-400 text-sm pt-4">
                  <p>Esta é uma oferta única e exclusiva. Não será oferecida novamente.</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <div className="flex justify-center">
          <Logo size="sm" />
        </div>
      </div>
    </div>
  );
};

export default UpsellPage;