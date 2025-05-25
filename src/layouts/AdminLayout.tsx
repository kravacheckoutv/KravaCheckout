import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const navItems = [
    { 
      path: '/admin/dashboard', 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/admin/products', 
      name: 'Produtos', 
      icon: <Package size={20} /> 
    },
    { 
      path: '/admin/orders', 
      name: 'Pedidos', 
      icon: <ShoppingCart size={20} /> 
    },
    { 
      path: '/admin/customers', 
      name: 'Clientes', 
      icon: <Users size={20} /> 
    },
    { 
      path: '/admin/subscriptions', 
      name: 'Assinaturas', 
      icon: <CreditCard size={20} /> 
    },
    { 
      path: '/admin/settings', 
      name: 'Configurações', 
      icon: <Settings size={20} /> 
    },
  ];
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-krava-black text-white">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 w-64 h-full bg-krava-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-krava-gray-800">
            <Logo size="md" />
            <button 
              className="lg:hidden text-krava-gray-400 hover:text-white"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-krava-green text-krava-black font-medium' 
                      : 'text-krava-gray-300 hover:bg-krava-gray-800'
                  }`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-krava-gray-800">
            <Button 
              variant="outline" 
              fullWidth 
              leftIcon={<LogOut size={18} />}
              onClick={handleSignOut}
            >
              Sair
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-krava-gray-900 border-b border-krava-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="lg:hidden text-krava-gray-400 hover:text-white mr-4"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-medium">Painel Administrativo</h1>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-krava-black p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;