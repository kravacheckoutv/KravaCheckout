import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  CreditCard, 
  Check, 
  Copy, 
  ChevronRight,
  ShoppingCart,
  Loader
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import toast from 'react-hot-toast';

interface FormFields {
  [key: string]: string;
}

const CheckoutPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProductBySlug } = useProducts();
  const { createOrder, startPaymentPolling } = useOrders();
  const { findOrCreateCustomer } = useCustomers();
  
  const [product, setProduct] = useState<any>(null);
  const [orderBumpProduct, setOrderBumpProduct] = useState<any>(null);
  const [formFields, setFormFields] = useState<FormFields>({});
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'loading'>('form');
  const [pixData, setPixData] = useState<{
    qrCode: string;
    copiaECola: string;
    txid: string;
  } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (slug) {
        const productData = await getProductBySlug(slug);
        if (productData) {
          setProduct(productData);
          
          // Initialize form fields based on product's custom fields
          if (productData.config_checkout?.campos_personalizados) {
            const initialFields: FormFields = {};
            productData.config_checkout.campos_personalizados.forEach((field: any) => {
              initialFields[field.nome.toLowerCase()] = '';
            });
            setFormFields(initialFields);
          }
          
          // Load order bump product if defined
          if (productData.order_bump_produto_id) {
            const orderBumpData = await getProductBySlug(productData.order_bump_produto_id);
            if (orderBumpData) {
              setOrderBumpProduct(orderBumpData);
            }
          }
        } else {
          navigate('/');
        }
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [slug, getProductBySlug, navigate]);
  
  // Handle form field changes
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [fieldName.toLowerCase()]: value
    }));
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Calculate total
  const calculateTotal = () => {
    let total = product?.valor || 0;
    
    if (includeOrderBump && orderBumpProduct) {
      total += orderBumpProduct.valor;
    }
    
    return total;
  };
  
  // Copy PIX code to clipboard
  const copyPixCode = () => {
    if (pixData?.copiaECola) {
      navigator.clipboard.writeText(pixData.copiaECola);
      toast.success('Código PIX copiado!');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    let hasError = false;
    const requiredFields = product.config_checkout.campos_personalizados
      .filter((field: any) => field.obrigatorio)
      .map((field: any) => field.nome.toLowerCase());
    
    requiredFields.forEach(field => {
      if (!formFields[field] || formFields[field].trim() === '') {
        toast.error(`O campo ${field} é obrigatório`);
        hasError = true;
      }
    });
    
    if (hasError) return;
    
    try {
      setSubmitting(true);
      setPaymentStep('loading');
      
      // Extract customer data from form fields
      const customerData = {
        name: formFields['nome'] || '',
        email: formFields['email'] || '',
        tax_id: formFields['cpf'] || undefined,
        phone: formFields['telefone'] || undefined,
      };
      
      // Find or create customer
      const userId = await findOrCreateCustomer(
        customerData.email,
        {
          nome: customerData.name,
          telefone: customerData.phone,
          cpf: customerData.tax_id
        }
      );
      
      // Create order
      const { order, pixData: orderPixData } = await createOrder({
        usuario_id: userId,
        produto_id: product.id,
        valor: calculateTotal(),
        includeOrderBump,
        customerData,
        productName: product.nome
      });
      
      if (order && orderPixData) {
        setOrderId(order.id);
        setPixData(orderPixData);
        setPaymentStep('payment');
        
        // Start polling for payment status
        startPaymentPolling(orderPixData.txid, order.id);
      } else {
        throw new Error('Erro ao criar pedido');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      setPaymentStep('form');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-krava-green mb-4"></div>
        <p className="text-krava-gray-300">Carregando checkout...</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {product.config_checkout?.banner && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={product.config_checkout.banner} 
              alt={product.nome} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Form - 7 columns on larger screens */}
          <div className="lg:col-span-7 space-y-6">
            {paymentStep === 'form' && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.nome}</h1>
                  {product.config_checkout?.texto_chamada && (
                    <p className="text-krava-gray-300">{product.config_checkout.texto_chamada}</p>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {product.config_checkout?.campos_personalizados.map((field: any, index: number) => {
                    const fieldName = field.nome.toLowerCase();
                    const fieldValue = formFields[fieldName] || '';
                    
                    return (
                      <Input
                        key={index}
                        label={field.nome}
                        name={fieldName}
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                        required={field.obrigatorio}
                        type={field.tipo === 'email' ? 'email' : 'text'}
                      />
                    );
                  })}
                  
                  {/* Order Bump */}
                  {orderBumpProduct && (
                    <div 
                      className="border-2 rounded-lg p-4 mt-6"
                      style={{ borderColor: themeColor }}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="orderBump"
                          className="checkbox mt-1"
                          checked={includeOrderBump}
                          onChange={(e) => setIncludeOrderBump(e.target.checked)}
                          style={{ 
                            backgroundColor: includeOrderBump ? themeColor : undefined,
                            borderColor: themeColor 
                          }}
                        />
                        <div className="ml-3">
                          <label htmlFor="orderBump" className="font-medium cursor-pointer">
                            Adicione {orderBumpProduct.nome} por apenas {formatCurrency(orderBumpProduct.valor)}
                          </label>
                          <p className="text-sm text-krava-gray-400 mt-1">
                            {orderBumpProduct.descricao.length > 100
                              ? `${orderBumpProduct.descricao.slice(0, 100)}...`
                              : orderBumpProduct.descricao}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={submitting}
                      style={{ backgroundColor: themeColor }}
                      className="py-4 text-lg"
                    >
                      Gerar Pagamento via PIX
                    </Button>
                  </div>
                </form>
              </>
            )}
            
            {paymentStep === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader size={48} className="animate-spin text-krava-green mb-4" />
                <h2 className="text-xl font-semibold mb-2">Gerando seu pagamento</h2>
                <p className="text-krava-gray-300">Por favor, aguarde enquanto processamos seu pedido...</p>
              </div>
            )}
            
            {paymentStep === 'payment' && pixData && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Pagamento via PIX</h2>
                  <p className="text-krava-gray-300">
                    Escaneie o QR Code abaixo ou copie o código para pagar
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                  <img 
                    src={pixData.qrCode} 
                    alt="QR Code PIX" 
                    className="max-w-full h-auto mb-4"
                  />
                  
                  <div className="w-full mt-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={pixData.copiaECola}
                        readOnly
                        className="input pr-12 text-krava-black bg-krava-gray-200 border-krava-gray-300"
                      />
                      <button
                        type="button"
                        onClick={copyPixCode}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-krava-gray-600 hover:text-krava-black"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-krava-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Instruções:</h3>
                  <ol className="space-y-2 text-sm text-krava-gray-300 list-decimal list-inside">
                    <li>Abra o aplicativo do seu banco</li>
                    <li>Escolha a opção de pagamento via PIX</li>
                    <li>Escaneie o QR Code ou cole o código PIX</li>
                    <li>Confirme as informações e finalize o pagamento</li>
                    <li>O sistema irá verificar automaticamente seu pagamento</li>
                  </ol>
                </div>
                
                <div className="text-center text-krava-gray-400 text-sm">
                  <p>Após a confirmação do pagamento, você será redirecionado automaticamente</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary - 5 columns on larger screens */}
          <div className="lg:col-span-5">
            <Card>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-krava-gray-800">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-krava-gray-800 rounded-md flex items-center justify-center mr-3">
                          <Package size={24} className="text-krava-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{product.nome}</p>
                          <p className="text-sm text-krava-gray-400">Produto principal</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatCurrency(product.valor)}</p>
                    </div>
                    
                    {includeOrderBump && orderBumpProduct && (
                      <div className="flex justify-between items-center py-4 border-b border-krava-gray-800">
                        <div className="flex items-center">
                          <div 
                            className="h-12 w-12 rounded-md flex items-center justify-center mr-3"
                            style={{ backgroundColor: themeColor + '20' }}
                          >
                            <Check size={24} style={{ color: themeColor }} />
                          </div>
                          <div>
                            <p className="font-medium">{orderBumpProduct.nome}</p>
                            <p className="text-sm text-krava-gray-400">Adicionado ao pedido</p>
                          </div>
                        </div>
                        <p className="font-medium">{formatCurrency(orderBumpProduct.valor)}</p>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-krava-gray-400">Subtotal</p>
                        <p>{formatCurrency(calculateTotal())}</p>
                      </div>
                      
                      <div className="flex justify-between items-center font-bold text-lg mt-4">
                        <p>Total</p>
                        <p style={{ color: themeColor }}>{formatCurrency(calculateTotal())}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-center bg-krava-gray-800 p-3 rounded-md">
                    <CreditCard size={20} className="text-krava-gray-400 mr-2" />
                    <span className="text-sm text-krava-gray-300">Pagamento seguro via PIX</span>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-center">
                  <Logo size="sm" />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;