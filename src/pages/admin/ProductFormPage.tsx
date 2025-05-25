import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Link as LinkIcon, 
  File, 
  Users,
  Palette,
  Image,
  Type,
  FormInput,
  Plus,
  Trash2,
  Copy,
  Package,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useProducts, Product, ProductInsert, ProductUpdate } from '../../hooks/useProducts';
import { HexColorPicker } from 'react-colorful';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

// Field types for custom checkout fields
const FIELD_TYPES = [
  { value: 'texto', label: 'Texto' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'cpf', label: 'CPF' },
];

// Default checkout config
const DEFAULT_CHECKOUT_CONFIG = {
  cor_primaria: '#00ff2a',
  banner: null,
  texto_chamada: 'Adquira este produto agora!',
  campos_personalizados: [
    { nome: 'Nome', tipo: 'texto', obrigatorio: true },
    { nome: 'E-mail', tipo: 'email', obrigatorio: true },
  ]
};

// Default new product
const DEFAULT_NEW_PRODUCT = {
  nome: '',
  slug: '',
  descricao: '',
  valor: 0,
  tipo: 'produto único' as const,
  status: 'inativo' as const,
  imagem: null,
  config_checkout: DEFAULT_CHECKOUT_CONFIG,
  upsell_produto_id: null,
  order_bump_produto_id: null,
  forma_entrega: 'link' as const,
  entrega_conteudo: null,
};

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, getProduct, createProduct, updateProduct } = useProducts();
  
  const [product, setProduct] = useState<ProductInsert | ProductUpdate>(DEFAULT_NEW_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'checkout', 'delivery'
  const [checkoutLink, setCheckoutLink] = useState('');
  
  // Load product data if editing an existing product
  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setLoading(true);
        const productData = await getProduct(id);
        if (productData) {
          setProduct(productData);
          setCheckoutLink(`${window.location.origin}/checkout/${productData.slug}`);
        } else {
          navigate('/admin/products');
        }
        setLoading(false);
      } else {
        // New product
        setProduct(DEFAULT_NEW_PRODUCT);
      }
    };
    
    loadProduct();
  }, [id, getProduct, navigate]);
  
  // Update checkout link when slug changes
  useEffect(() => {
    if (product.slug) {
      setCheckoutLink(`${window.location.origin}/checkout/${product.slug}`);
    }
  }, [product.slug]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'valor') {
      // Convert string to number and handle decimal values
      const numValue = parseFloat(value.replace(',', '.'));
      setProduct(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from name if slug is empty
      if (name === 'nome' && (!product.slug || product.slug === '')) {
        const slug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        
        setProduct(prev => ({ ...prev, slug }));
      }
    }
  };
  
  // Handle color change for checkout
  const handleColorChange = (color: string) => {
    setProduct(prev => ({
      ...prev,
      config_checkout: {
        ...prev.config_checkout!,
        cor_primaria: color
      }
    }));
  };
  
  // Handle text chamada change
  const handleChamadaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProduct(prev => ({
      ...prev,
      config_checkout: {
        ...prev.config_checkout!,
        texto_chamada: e.target.value
      }
    }));
  };
  
  // Add a new custom field to checkout
  const addCustomField = () => {
    setProduct(prev => ({
      ...prev,
      config_checkout: {
        ...prev.config_checkout!,
        campos_personalizados: [
          ...prev.config_checkout!.campos_personalizados,
          { nome: 'Novo Campo', tipo: 'texto', obrigatorio: false }
        ]
      }
    }));
  };
  
  // Update a custom field
  const updateCustomField = (index: number, field: { nome: string; tipo: string; obrigatorio: boolean }) => {
    const updatedFields = [...product.config_checkout!.campos_personalizados];
    updatedFields[index] = field;
    
    setProduct(prev => ({
      ...prev,
      config_checkout: {
        ...prev.config_checkout!,
        campos_personalizados: updatedFields
      }
    }));
  };
  
  // Remove a custom field
  const removeCustomField = (index: number) => {
    const updatedFields = [...product.config_checkout!.campos_personalizados];
    updatedFields.splice(index, 1);
    
    setProduct(prev => ({
      ...prev,
      config_checkout: {
        ...prev.config_checkout!,
        campos_personalizados: updatedFields
      }
    }));
  };
  
  // Handle banner image upload
  const onBannerDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setProduct(prev => ({
          ...prev,
          config_checkout: {
            ...prev.config_checkout!,
            banner: dataUrl
          }
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle product image upload
  const onProductImageDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setProduct(prev => ({
          ...prev,
          imagem: dataUrl
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle delivery content upload (for 'arquivo' type)
  const onDeliveryContentDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setProduct(prev => ({
          ...prev,
          entrega_conteudo: dataUrl
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Configure dropzone for banner
  const bannerDropzone = useDropzone({
    onDrop: onBannerDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  });
  
  // Configure dropzone for product image
  const productImageDropzone = useDropzone({
    onDrop: onProductImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  });
  
  // Configure dropzone for delivery content
  const deliveryContentDropzone = useDropzone({
    onDrop: onDeliveryContentDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
      'video/*': ['.mp4', '.webm'],
      'audio/*': ['.mp3', '.wav'],
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 52428800, // 50MB
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use a local variable to ensure we're validating the current state
    const currentProductName = product.nome;
    console.log("Validating product name:", currentProductName); // Log using the local var

    // Validation
    if (!currentProductName || currentProductName.trim() === '') { // Validate using the local var
      toast.error('O nome do produto é obrigatório');
      return;
    }
    
    if (!product.slug || product.slug.trim() === '') {
      toast.error('O slug do produto é obrigatório');
      return;
    }
    
    if (product.valor <= 0) {
      toast.error('O valor do produto deve ser maior que zero');
      return;
    }
    
    if (
      product.forma_entrega === 'link' && 
      (!product.entrega_conteudo || product.entrega_conteudo.trim() === '')
    ) {
      toast.error('O link de entrega é obrigatório');
      return;
    }
    
    setLoading(true);
    
    try {
      if (id) {
        // Update existing product
        await updateProduct(id, product);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Create new product
        await createProduct(product as ProductInsert);
        toast.success('Produto criado com sucesso!');
        // Navigate happens in createProduct function
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };
  
  // Copy checkout link to clipboard
  const copyCheckoutLink = () => {
    navigator.clipboard.writeText(checkoutLink);
    toast.success('Link copiado para a área de transferência');
  };
  
  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-krava-green"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/products')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? 'Editar Produto' : 'Novo Produto'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/products')}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Save size={18} />}
            onClick={handleSubmit}
            isLoading={loading}
          >
            Salvar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Main content - 9 columns on larger screens */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Tabs for different sections */}
          <div className="flex border-b border-krava-gray-800">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'basic'
                  ? 'text-krava-green border-b-2 border-krava-green'
                  : 'text-krava-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              Informações Básicas
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'checkout'
                  ? 'text-krava-green border-b-2 border-krava-green'
                  : 'text-krava-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('checkout')}
            >
              Checkout
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'delivery'
                  ? 'text-krava-green border-b-2 border-krava-green'
                  : 'text-krava-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('delivery')}
            >
              Entrega
            </button>
          </div>
          
          {/* Basic Information Form */}
          {activeTab === 'basic' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Informações do Produto</h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nome do Produto"
                    name="nome"
                    value={product.nome}
                    onChange={handleChange}
                    placeholder="Ex: Curso de Marketing Digital"
                  />
                  
                  <Input
                    label="Slug (URL)"
                    name="slug"
                    value={product.slug}
                    onChange={handleChange}
                    placeholder="Ex: curso-marketing-digital"
                    helperText="Usado na URL do checkout"
                  />
                </div>
                
                <div>
                  <label htmlFor="descricao" className="label">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={product.descricao}
                    onChange={handleChange}
                    rows={4}
                    className="input"
                    placeholder="Descreva seu produto..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Valor (R$)"
                    name="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.valor}
                    onChange={handleChange}
                    placeholder="0,00"
                  />
                  
                  <div>
                    <label htmlFor="tipo" className="label">
                      Tipo de Produto
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={product.tipo}
                      onChange={handleChange}
                      className="select"
                    >
                      <option value="produto único">Produto Único</option>
                      <option value="assinatura">Assinatura</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="label">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={product.status}
                      onChange={handleChange}
                      className="select"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="label">Imagem do Produto</label>
                  <div
                    {...productImageDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                      productImageDropzone.isDragActive
                        ? 'border-krava-green bg-krava-green bg-opacity-5'
                        : 'border-krava-gray-700 hover:border-krava-gray-600'
                    }`}
                  >
                    <input {...productImageDropzone.getInputProps()} />
                    {product.imagem ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={product.imagem}
                          alt="Preview"
                          className="h-32 object-contain mb-2"
                        />
                        <p className="text-sm text-krava-gray-400">
                          Clique ou arraste para trocar a imagem
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={36} className="text-krava-gray-500 mb-2" />
                        <p className="text-krava-gray-300">
                          Clique ou arraste uma imagem para upload
                        </p>
                        <p className="text-sm text-krava-gray-500 mt-1">
                          PNG, JPG ou WEBP (máx. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          
          {/* Checkout Configuration */}
          {activeTab === 'checkout' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Configuração do Checkout</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Cor Primária</label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-md cursor-pointer border border-krava-gray-700"
                          style={{ backgroundColor: product.config_checkout?.cor_primaria }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        ></div>
                        <Input
                          value={product.config_checkout?.cor_primaria}
                          onChange={(e) => handleColorChange(e.target.value)}
                          leftIcon={<Palette size={18} />}
                        />
                      </div>
                      
                      {showColorPicker && (
                        <div className="relative mt-2">
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowColorPicker(false)}
                          ></div>
                          <div className="absolute z-20">
                            <HexColorPicker 
                              color={product.config_checkout?.cor_primaria} 
                              onChange={handleColorChange} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="label">Banner do Checkout</label>
                      <div
                        {...bannerDropzone.getRootProps()}
                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                          bannerDropzone.isDragActive
                            ? 'border-krava-green bg-krava-green bg-opacity-5'
                            : 'border-krava-gray-700 hover:border-krava-gray-600'
                        }`}
                      >
                        <input {...bannerDropzone.getInputProps()} />
                        {product.config_checkout?.banner ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={product.config_checkout.banner}
                              alt="Banner Preview"
                              className="h-32 object-contain mb-2"
                            />
                            <p className="text-sm text-krava-gray-400">
                              Clique ou arraste para trocar o banner
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Image size={36} className="text-krava-gray-500 mb-2" />
                            <p className="text-krava-gray-300">
                              Clique ou arraste uma imagem para o banner
                            </p>
                            <p className="text-sm text-krava-gray-500 mt-1">
                              Recomendado: 1200 x 400px (máx. 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="texto_chamada" className="label">
                      Texto de Chamada
                    </label>
                    <textarea
                      id="texto_chamada"
                      value={product.config_checkout?.texto_chamada}
                      onChange={handleChamadaChange}
                      rows={3}
                      className="input"
                      placeholder="Ex: Adquira agora o melhor curso do mercado!"
                    ></textarea>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Campos Personalizados</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus size={16} />}
                    onClick={addCustomField}
                  >
                    Adicionar Campo
                  </Button>
                </CardHeader>
                <CardBody className="space-y-4">
                  {product.config_checkout?.campos_personalizados.map((field, index) => (
                    <div key={index} className="border border-krava-gray-800 rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Campo {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomField(index)}
                        >
                          <Trash2 size={16} className="text-error-500" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Nome do Campo"
                          value={field.nome}
                          onChange={(e) => {
                            const updatedField = { ...field, nome: e.target.value };
                            updateCustomField(index, updatedField);
                          }}
                          leftIcon={<Type size={18} />}
                        />
                        
                        <div>
                          <label className="label">Tipo</label>
                          <select
                            value={field.tipo}
                            onChange={(e) => {
                              const updatedField = { ...field, tipo: e.target.value as any };
                              updateCustomField(index, updatedField);
                            }}
                            className="select"
                          >
                            {FIELD_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <label className="inline-flex items-center mt-6">
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={field.obrigatorio}
                              onChange={(e) => {
                                const updatedField = { ...field, obrigatorio: e.target.checked };
                                updateCustomField(index, updatedField);
                              }}
                            />
                            <span className="ml-2 text-krava-gray-300">Obrigatório</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {product.config_checkout?.campos_personalizados.length === 0 && (
                    <div className="text-center py-6 text-krava-gray-400">
                      <FormInput size={36} className="mx-auto mb-2" />
                      <p>Nenhum campo personalizado adicionado</p>
                      <p className="text-sm mt-1">
                        Adicione campos para coletar informações dos clientes
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Upsell e Order Bump</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <label htmlFor="order_bump_produto_id" className="label">
                      Order Bump (produto oferecido no checkout)
                    </label>
                    <select
                      id="order_bump_produto_id"
                      name="order_bump_produto_id"
                      value={product.order_bump_produto_id || ''}
                      onChange={handleChange}
                      className="select"
                    >
                      <option value="">Sem Order Bump</option>
                      {products
                        .filter(p => p.id !== id) // Exclude current product
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nome} - {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="upsell_produto_id" className="label">
                      Upsell (produto oferecido após pagamento)
                    </label>
                    <select
                      id="upsell_produto_id"
                      name="upsell_produto_id"
                      value={product.upsell_produto_id || ''}
                      onChange={handleChange}
                      className="select"
                    >
                      <option value="">Sem Upsell</option>
                      {products
                        .filter(p => p.id !== id) // Exclude current product
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nome} - {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </option>
                        ))}
                    </select>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
          
          {/* Delivery Configuration */}
          {activeTab === 'delivery' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Configuração de Entrega</h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label htmlFor="forma_entrega" className="label">
                    Forma de Entrega
                  </label>
                  <select
                    id="forma_entrega"
                    name="forma_entrega"
                    value={product.forma_entrega}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="link">Link (redirecionamento)</option>
                    <option value="arquivo">Arquivo para download</option>
                    <option value="área de membros">Área de membros</option>
                  </select>
                </div>
                
                {product.forma_entrega === 'link' && (
                  <Input
                    label="Link de Entrega"
                    name="entrega_conteudo"
                    value={product.entrega_conteudo || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                    leftIcon={<LinkIcon size={18} />}
                    helperText="URL para onde o cliente será redirecionado após o pagamento"
                  />
                )}
                
                {product.forma_entrega === 'arquivo' && (
                  <div>
                    <label className="label">Arquivo para Download</label>
                    <div
                      {...deliveryContentDropzone.getRootProps()}
                      className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                        deliveryContentDropzone.isDragActive
                          ? 'border-krava-green bg-krava-green bg-opacity-5'
                          : 'border-krava-gray-700 hover:border-krava-gray-600'
                      }`}
                    >
                      <input {...deliveryContentDropzone.getInputProps()} />
                      {product.entrega_conteudo ? (
                        <div className="flex flex-col items-center">
                          <File size={48} className="text-krava-green mb-2" />
                          <p className="text-krava-gray-300">
                            Arquivo carregado com sucesso
                          </p>
                          <p className="text-sm text-krava-gray-400 mt-1">
                            Clique ou arraste para substituir
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={36} className="text-krava-gray-500 mb-2" />
                          <p className="text-krava-gray-300">
                            Clique ou arraste um arquivo para upload
                
                          </p>
                          <p className="text-sm text-krava-gray-500 mt-1">
                            PDF, ZIP, MP4, MP3, etc (máx. 50MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {product.forma_entrega === 'área de membros' && (
                  <div className="bg-krava-gray-800 rounded-md p-4">
                    <div className="flex items-start">
                      <Users size={24} className="text-krava-gray-400 mt-1 mr-3" />
                      <div>
                        <h4 className="font-medium">Integração com Área de Membros</h4>
                        <p className="text-krava-gray-400 text-sm mt-1">
                          Esta funcionalidade está em desenvolvimento. Após o pagamento,
                          o cliente será redirecionado para a página de agradecimento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
        
        {/* Preview/Settings Sidebar - 3 columns on larger screens */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Prévia</h3>
            </CardHeader>
            <CardBody className="text-center">
              <div className="aspect-video bg-krava-gray-800 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                {product.imagem ? (
                  <img
                    src={product.imagem}
                    alt={product.nome}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Package size={48} className="text-krava-gray-700" />
                )}
              </div>
              
              <h4 className="font-semibold text-white mb-1">
                {product.nome || 'Nome do Produto'}
              </h4>
              
              <p className="text-krava-green text-lg font-bold mb-2">
                {product.valor
                  ? product.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  : 'R$ 0,00'}
              </p>
              
              <div className="flex justify-center">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'ativo'
                      ? 'bg-success-500 bg-opacity-10 text-success-500'
                      : 'bg-krava-gray-700 text-krava-gray-300'
                  }`}
                >
                  {product.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardBody>
            <CardFooter className="flex justify-center">
              {id && product.slug && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink size={16} />}
                  href={`/checkout/${product.slug}`}
                  target="_blank"
                >
                  Ver Checkout
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {id && product.slug && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Link do Checkout</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center">
                  <Input
                    value={checkoutLink}
                    readOnly
                    className="pr-12"
                  />
                  <Button
                    variant="ghost"
                    className="-ml-11"
                    onClick={copyCheckoutLink}
                    title="Copiar link"
                  >
                    <Copy size={18} className="text-krava-gray-400 hover:text-white" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;