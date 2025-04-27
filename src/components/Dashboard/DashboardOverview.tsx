import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Progress,Spin } from 'antd';
import { UserOutlined, DollarOutlined, BankOutlined, AlertOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Types
import { CustomerData } from '../../types/customer';

// Utils
import { calculateAllRiskScores, getRiskColor } from '../../utils/riskScoring';

const { Title } = Typography;

interface DashboardOverviewProps {
  customerData: CustomerData[];
  loading: boolean;
  isDarkMode?: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  customerData, 
  loading,
  isDarkMode = false
}) => {
  // Calculate risk scores
  const riskScores = useMemo(() => {
    return calculateAllRiskScores(customerData);
  }, [customerData]);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const totalCustomers = customerData.length;
    
    if (totalCustomers === 0) {
      return {
        totalCustomers: 0,
        averageIncome: 0,
        averageExpenses: 0,
        averageCreditScore: 0,
        totalOutstandingLoans: 0,
        highRiskCustomers: 0,
      };
    }

    const totalIncome = customerData.reduce((sum, customer) => sum + customer.monthlyIncome, 0);
    const totalExpenses = customerData.reduce((sum, customer) => sum + customer.monthlyExpenses, 0);
    const totalCreditScore = customerData.reduce((sum, customer) => sum + customer.creditScore, 0);
    const outstandingLoans = customerData.reduce((sum, customer) => sum + customer.outstandingLoans, 0);
    const highRiskCount = riskScores.filter(score => score.level === 'High').length;

    return {
      totalCustomers,
      averageIncome: totalIncome / totalCustomers,
      averageExpenses: totalExpenses / totalCustomers,
      averageCreditScore: totalCreditScore / totalCustomers,
      totalOutstandingLoans: outstandingLoans,
      highRiskCustomers: highRiskCount
    };
  }, [customerData, riskScores]);

  // Prepare data for the income vs expenses chart
  const incomeExpenseData = useMemo(() => {
    return customerData.map(customer => ({
      name: customer.name.split(' ')[0],
      income: customer.monthlyIncome,
      expenses: customer.monthlyExpenses
    }));
  }, [customerData]);

  // Prepare data for risk distribution pie chart
  const riskDistributionData = useMemo(() => {
    const lowRisk = riskScores.filter(score => score.level === 'Low').length;
    const mediumRisk = riskScores.filter(score => score.level === 'Medium').length;
    const highRisk = riskScores.filter(score => score.level === 'High').length;

    return [
      { name: 'Low Risk', value: lowRisk },
      { name: 'Medium Risk', value: mediumRisk },
      { name: 'High Risk', value: highRisk }
    ];
  }, [riskScores]);

  // Colors for the pie chart
  const RISK_COLORS = ['#52c41a', '#faad14', '#f5222d'];

  // Table columns for customer data
  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      sorter: (a: CustomerData, b: CustomerData) => a.customerId.localeCompare(b.customerId),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: CustomerData, b: CustomerData) => a.name.localeCompare(b.name),
    },
    {
      title: 'Income',
      dataIndex: 'monthlyIncome',
      key: 'monthlyIncome',
      sorter: (a: CustomerData, b: CustomerData) => a.monthlyIncome - b.monthlyIncome,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Expenses',
      dataIndex: 'monthlyExpenses',
      key: 'monthlyExpenses',
      sorter: (a: CustomerData, b: CustomerData) => a.monthlyExpenses - b.monthlyExpenses,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Credit Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      sorter: (a: CustomerData, b: CustomerData) => a.creditScore - b.creditScore,
    },
    {
      title: 'Risk Level',
      key: 'riskLevel',
      render: (text: string, record: CustomerData) => {
        const customerRisk = riskScores.find(score => score.customerId === record.customerId);
        if (!customerRisk) return 'N/A';
        
        return (
          <span style={{ color: getRiskColor(customerRisk.score) }}>
            {customerRisk.level} ({customerRisk.score})
          </span>
        );
      },
      sorter: (a: CustomerData, b: CustomerData) => {
        const aRisk = riskScores.find(score => score.customerId === a.customerId)?.score || 0;
        const bRisk = riskScores.find(score => score.customerId === b.customerId)?.score || 0;
        return aRisk - bRisk;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: CustomerData, b: CustomerData) => a.status.localeCompare(b.status),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ color: isDarkMode ? '#fff' : undefined }}>Dashboard Overview</Title>
      
      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Total Customers</span>}
              value={metrics.totalCustomers}
              prefix={<UserOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />}
              valueStyle={{ color: isDarkMode ? '#fff' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Average Income</span>}
              value={metrics.averageIncome.toFixed(2)}
              precision={2}
              prefix={<DollarOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />}
              suffix="USD"
              valueStyle={{ color: isDarkMode ? '#fff' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Outstanding Loans</span>}
              value={metrics.totalOutstandingLoans}
              precision={0}
              prefix={<BankOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />}
              suffix="USD"
              valueStyle={{ 
                color: metrics.totalOutstandingLoans > 50000 ? '#cf1322' : '#3f8600',
                filter: isDarkMode ? 'brightness(1.2)' : undefined
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>High Risk Customers</span>}
              value={metrics.highRiskCustomers}
              prefix={<AlertOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />}
              valueStyle={{ 
                color: metrics.highRiskCustomers > 0 ? '#cf1322' : '#3f8600',
                filter: isDarkMode ? 'brightness(1.2)' : undefined
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Income vs. Expenses</span>}
            style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#303030' : '#d9d9d9'} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDarkMode ? '#fff' : '#666'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#fff' : '#666'}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                    border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
                    color: isDarkMode ? '#fff' : undefined
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Monthly Income"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#82ca9d" 
                  name="Monthly Expenses"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Risk Distribution</span>}
            style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => (
                    <text
                      x={0}
                      y={0}
                      fill={isDarkMode ? '#fff' : '#000'}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {`${name}: ${(percent * 100).toFixed(0)}%`}
                    </text>
                  )}
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={RISK_COLORS[index % RISK_COLORS.length]}
                      style={{ filter: isDarkMode ? 'brightness(1.2)' : undefined }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${Number(value)} customers`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                    border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
                    color: isDarkMode ? '#fff' : undefined
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Customer Data Table */}
      <Card 
        title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Customer Data</span>}
        style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}
      >
        <Table 
          dataSource={customerData} 
          columns={columns} 
          rowKey="customerId"
          pagination={{ 
            pageSize: 5,
            responsive: true,
            style: { color: isDarkMode ? '#fff' : undefined }
          }}
          scroll={{ x: 'max-content' }}
          style={{ color: isDarkMode ? '#fff' : undefined }}
        />
      </Card>
    </div>
  );
};

export default DashboardOverview;