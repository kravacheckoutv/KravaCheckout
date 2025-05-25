import React, { useState } from 'react';
import { Save, CreditCard, Bell, Webhook, Key } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const [pushInPayKey, setPushInPayKey] = useState('30776|Qy1j2nT3IWZxauckYvanoQKszXJkM4CjtcAaeAnVcec772d3');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real application, this would save to the database or environment variables
    toast.success('Configurações salvas com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Gateway Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CreditCard size={20} className="text-krava-green mr-2" />
              <h3 className="text-lg font-semibold">Gateway de Pagamento</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div>
              <label className="label">Chave da API Push In Pay</label>
              <div className="flex items-center">
                <Input
                  type="password"
                  value={pushInPayKey}
                  onChange={(e) => setPushInPayKey(e.target.value)}
                  leftIcon={<Key size={18} />}
                />
              </div>
              <p className="text-sm text-krava-gray-400 mt-1">
                Esta chave é usada para integração com a API de pagamentos.
              </p>
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Save size={18} />}
              onClick={handleSaveSettings}
            >
              Salvar Configurações
            </Button>
          </CardBody>
        </Card>
        
        {/* Webhook Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Webhook size={20} className="text-krava-green mr-2" />
              <h3 className="text-lg font-semibold">Webhooks</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div>
              <label className="label">URL do Webhook</label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seudominio.com/webhook"
                leftIcon={<Webhook size={18} />}
              />
              <p className="text-sm text-krava-gray-400 mt-1">
                URL para receber notificações de eventos (pagamentos, cancelamentos, etc).
              </p>
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Save size={18} />}
              onClick={handleSaveSettings}
            >
              Salvar Configurações
            </Button>
          </CardBody>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Bell size={20} className="text-krava-green mr-2" />
              <h3 className="text-lg font-semibold">Notificações</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span className="ml-2">Notificações por E-mail</span>
              </label>
              <p className="text-sm text-krava-gray-400 mt-1 ml-7">
                Enviar e-mails automáticos para clientes após pagamento.
              </p>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={whatsappNotifications}
                  onChange={(e) => setWhatsappNotifications(e.target.checked)}
                />
                <span className="ml-2">Notificações por WhatsApp</span>
              </label>
              <p className="text-sm text-krava-gray-400 mt-1 ml-7">
                Enviar mensagens automáticas pelo WhatsApp após pagamento.
              </p>
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Save size={18} />}
              onClick={handleSaveSettings}
            >
              Salvar Configurações
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;