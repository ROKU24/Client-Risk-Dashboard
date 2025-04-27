import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Button, Switch, theme, ConfigProvider } from 'antd';
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
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = theme.useToken();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          borderRadius: 6,
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed} 
            breakpoint="lg"
            collapsedWidth={window.innerWidth < 576 ? 0 : 80}
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
            }}
            theme={isDarkMode ? 'dark' : 'light'}
          >
            <div className="logo" style={{ 
              height: '32px', 
              margin: '12px', 
              background: 'transparent',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: token.colorPrimary,
              fontWeight: '600',
              fontSize: collapsed ? '11px' : '14px',
              letterSpacing: '0.2px',
              transition: 'all 0.3s',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingLeft: '4px',
              paddingRight: '4px'
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
          <Layout style={{ 
            marginLeft: collapsed ? (window.innerWidth < 576 ? 0 : 80) : 200, 
            transition: 'all 0.2s',
            position: 'relative',
            width: 'auto'
          }}>
            <Header style={{ 
              padding: '0 12px', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              width: '100%',
              backgroundColor: isDarkMode ? '#141414' : '#fff',
              minHeight: '64px'
            }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ 
                  fontSize: '16px',
                  height: 64,
                  color: isDarkMode ? '#fff' : undefined,
                }}
              />
              <Switch
                checkedChildren="🌙"
                unCheckedChildren="☀️"
                checked={isDarkMode}
                onChange={toggleTheme}
                style={{
                  marginRight: '8px',
                  position: 'relative',
                  zIndex: 2
                }}
              />
            </Header>
            <Content style={{ 
              margin: '24px 16px', 
              padding: '24px',
              borderRadius: 8,
              backgroundColor: isDarkMode ? '#141414' : '#fff',
              minHeight: 280,
              maxWidth: '1200px',
              width: '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
              overflow: 'visible',
              position: 'relative'
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
    </ConfigProvider>
  );
};

export default App;