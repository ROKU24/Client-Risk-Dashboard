import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Button, Switch, theme } from 'antd';
import {
  DashboardOutlined,
  AlertOutlined,
  SyncOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BulbOutlined,
} from '@ant-design/icons';

// Import components
import DashboardOverview from './components/Dashboard/DashboardOverview';
import RiskAssessment from './components/RiskAssessment/RiskAssessment';
import WorkflowManagement from './components/Workflow/WorkflowManagement';

// Import API functions
import { fetchCustomers, updateCustomerStatus } from './utils/api';

// Import types
import { CustomerData } from './types/customer';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = theme.useToken();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCustomers();
        setCustomerData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to load customer data:', error);
        setError('Failed to load customer data. Please check if the server is running.');
        setCustomerData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdateStatus = async (customerId: string, newStatus: 'Review' | 'Approved' | 'Rejected') => {
    try {
      const updatedCustomer = await updateCustomerStatus(customerId, newStatus);
      setCustomerData(prev => 
        prev.map(customer => 
          customer.customerId === customerId ? updatedCustomer : customer
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would update the theme here
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed} theme={isDarkMode ? 'dark' : 'light'}>
          <div className="logo" style={{ 
            height: '32px', 
            margin: '16px', 
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: token.colorPrimary,
            fontWeight: 'bold',
            fontSize: collapsed ? '12px' : '16px'
          }}>
            {collapsed ? 'CRD' : 'Credit Risk Dashboard'}
          </div>
          <Menu
            theme={isDarkMode ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {
                key: '1',
                icon: <DashboardOutlined />,
                label: <Link to="/">Dashboard</Link>,
              },
              {
                key: '2',
                icon: <AlertOutlined />,
                label: <Link to="/risk">Risk Assessment</Link>,
              },
              {
                key: '3',
                icon: <SyncOutlined />,
                label: <Link to="/workflow">Workflow</Link>,
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{ 
            padding: 0, 
            background: token.colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <div style={{ marginRight: 24 }}>
              <Switch
                checkedChildren="🌙"
                unCheckedChildren="☀️"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            </div>
          </Header>
          <Content style={{ 
            margin: '24px 16px', 
            padding: 24, 
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG
          }}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <DashboardOverview 
                    customerData={customerData} 
                    loading={loading}
                    isDarkMode={isDarkMode}
                  />
                } 
              />
              <Route 
                path="/risk" 
                element={
                  <RiskAssessment 
                    customerData={customerData} 
                    loading={loading}
                    isDarkMode={isDarkMode}
                  />
                } 
              />
              <Route 
                path="/workflow" 
                element={
                  <WorkflowManagement 
                    customerData={customerData} 
                    loading={loading} 
                    updateCustomerStatus={handleUpdateStatus}
                    isDarkMode={isDarkMode}
                  />
                } 
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;