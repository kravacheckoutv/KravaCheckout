import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { TrendingUp, ShoppingBag, UserCircle, CreditCard, Activity } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage: React.FC = () => {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [productsSold, setProductsSold] = useState<any[]>([]);
  
  useEffect(() => {
    if (orders.length > 0) {
      // Calculate daily revenue for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return format(date, 'yyyy-MM-dd');
      }).reverse();
      
      const revenueByDay = last7Days.map(day => {
        const dayOrders = orders.filter(order => 
          order.status === 'pago' && 
          order.data_criacao.startsWith(day)
        );
        
        const total = dayOrders.reduce((sum, order) => sum + order.valor, 0);
        
        return {
          day: format(new Date(day), 'd MMM', { locale: ptBR }),
          total
        };
      });
      
      setDailyRevenue(revenueByDay);
      
      // Calculate products sold
      const productCounts: Record<string, { nome: string; count: number }> = {};
      
      orders.forEach(order => {
        if (order.status === 'pago' && order.produtos) {
          const productId = order.produto_id;
          const productName = order.produtos.nome;
          
          if (!productCounts[productId]) {
            productCounts[productId] = { nome: productName, count: 0 };
          }
          
          productCounts[productId].count += 1;
        }
      });
      
      const sortedProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setProductsSold(sortedProducts);
    }
  }, [orders, products]);
  
  // Total revenue from paid orders
  const totalRevenue = orders
    .filter(order => order.status === 'pago')
    .reduce((sum, order) => sum + order.valor, 0);
  
  // Total number of orders
  const totalOrders = orders.length;
  
  // Total number of customers
  const totalCustomers = customers.length;
  
  // Total number of products
  const totalProducts = products.length;
  
  // Bar chart data
  const barChartData = {
    labels: dailyRevenue.map(day => day.day),
    datasets: [
      {
        label: 'Receita Diária (R$)',
        data: dailyRevenue.map(day => day.total),
        backgroundColor: '#00ff2a',
        borderColor: '#00cc52',
        borderWidth: 1,
      },
    ],
  };
  
  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#d1d1d1',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#a8a8a8',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#a8a8a8',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };
  
  // Doughnut chart data
  const doughnutChartData = {
    labels: productsSold.map(product => product.nome),
    datasets: [
      {
        data: productsSold.map(product => product.count),
        backgroundColor: [
          '#00ff2a',
          '#00cc52',
          '#00993d',
          '#006629',
          '#003314',
        ],
        borderColor: '#171717',
        borderWidth: 2,
      },
    ],
  };
  
  // Doughnut chart options
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#d1d1d1',
          padding: 20,
          boxWidth: 15,
          boxHeight: 15,
        },
      },
    },
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card hover>
          <CardBody className="flex items-center p-6">
            <div className="rounded-full p-3 bg-success-500 bg-opacity-10 mr-4">
              <TrendingUp size={24} className="text-success-500" />
            </div>
            <div>
              <p className="text-krava-gray-400 text-sm">Receita Total</p>
              <h3 className="text-2xl font-bold">{totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
            </div>
          </CardBody>
        </Card>
        
        {/* Total Orders */}
        <Card hover>
          <CardBody className="flex items-center p-6">
            <div className="rounded-full p-3 bg-primary-500 bg-opacity-10 mr-4">
              <ShoppingBag size={24} className="text-primary-500" />
            </div>
            <div>
              <p className="text-krava-gray-400 text-sm">Total de Pedidos</p>
              <h3 className="text-2xl font-bold">{totalOrders}</h3>
            </div>
          </CardBody>
        </Card>
        
        {/* Total Customers */}
        <Card hover>
          <CardBody className="flex items-center p-6">
            <div className="rounded-full p-3 bg-warning-500 bg-opacity-10 mr-4">
              <UserCircle size={24} className="text-warning-500" />
            </div>
            <div>
              <p className="text-krava-gray-400 text-sm">Total de Clientes</p>
              <h3 className="text-2xl font-bold">{totalCustomers}</h3>
            </div>
          </CardBody>
        </Card>
        
        {/* Total Products */}
        <Card hover>
          <CardBody className="flex items-center p-6">
            <div className="rounded-full p-3 bg-error-500 bg-opacity-10 mr-4">
              <CreditCard size={24} className="text-error-500" />
            </div>
            <div>
              <p className="text-krava-gray-400 text-sm">Total de Produtos</p>
              <h3 className="text-2xl font-bold">{totalProducts}</h3>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Receita dos Últimos 7 Dias</h3>
              <div className="rounded-full p-2 bg-krava-gray-800">
                <Activity size={18} className="text-krava-gray-400" />
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-4">
            <div className="h-72">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </CardBody>
        </Card>
        
        {/* Products Sold Chart */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Produtos Mais Vendidos</h3>
              <div className="rounded-full p-2 bg-krava-gray-800">
                <ShoppingBag size={18} className="text-krava-gray-400" />
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-4">
            <div className="h-64">
              {productsSold.length > 0 ? (
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-krava-gray-400">
                  Sem dados disponíveis
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;