import React, { useMemo, useState } from 'react';
import { Table, Card, Progress, Tag, Space, Input, Row, Col, Typography, Spin, Collapse } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Types
import { CustomerData, RiskScore } from '../../types/customer';

// Utils
import { calculateAllRiskScores, getRiskColor } from '../../utils/riskScoring';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface RiskAssessmentProps {
  customerData: CustomerData[];
  loading: boolean;
  isDarkMode?: boolean;
}

interface CustomerWithRisk extends CustomerData {
  riskScore: number;
  riskLevel: string; // Change to string to accept any value
  riskFactors: {
    creditScoreImpact: number;
    repaymentHistoryImpact: number;
    loanToIncomeRatioImpact: number;
  };
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ 
  customerData, 
  loading,
  isDarkMode = false
}) => {
  const [searchText, setSearchText] = useState<string>('');
  
  // Calculate risk scores for all customers
  const riskScores: RiskScore[] = useMemo(() => {
    return calculateAllRiskScores(customerData);
  }, [customerData]);

  // Combine customer data with risk scores for display
  const customersWithRisk = useMemo(() => {
    return customerData.map(customer => {
      const risk = riskScores.find(score => score.customerId === customer.customerId);
      return {
        ...customer,
        riskScore: risk?.score || 0,
        riskLevel: risk?.level || 'N/A',
        riskFactors: risk?.factors || {
          creditScoreImpact: 0,
          repaymentHistoryImpact: 0,
          loanToIncomeRatioImpact: 0
        }
      };
    });
  }, [customerData, riskScores]);

  // Filter customers based on search text
  const filteredCustomers = useMemo(() => {
    if (!searchText) return customersWithRisk;
    
    const searchLower = searchText.toLowerCase();
    return customersWithRisk.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      customer.customerId.toLowerCase().includes(searchLower) ||
      customer.riskLevel.toString().toLowerCase().includes(searchLower)
    );
  }, [customersWithRisk, searchText]);

  // Data for the risk distribution chart
  const riskChartData = useMemo(() => {
    const riskLevels = ['Low', 'Medium', 'High'];
    return riskLevels.map(level => ({
      name: level,
      customers: riskScores.filter(score => score.level === level).length
    }));
  }, [riskScores]);

  // Table columns
  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      sorter: (a: CustomerWithRisk, b: CustomerWithRisk) => a.customerId.localeCompare(b.customerId),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: CustomerWithRisk, b: CustomerWithRisk) => a.name.localeCompare(b.name),
    },
    {
      title: 'Credit Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      sorter: (a: CustomerWithRisk, b: CustomerWithRisk) => a.creditScore - b.creditScore,
    },
    {
      title: 'Loan/Income Ratio',
      key: 'loanIncomeRatio',
      render: (text: string, record: CustomerWithRisk) => {
        const ratio = (record.outstandingLoans / 24) / record.monthlyIncome;
        return (ratio * 100).toFixed(2) + '%';
      },
      sorter: (a: CustomerWithRisk, b: CustomerWithRisk) => {
        const ratioA = (a.outstandingLoans / 24) / a.monthlyIncome;
        const ratioB = (b.outstandingLoans / 24) / b.monthlyIncome;
        return ratioA - ratioB;
      },
    },
    {
      title: 'Repayment History',
      key: 'repaymentHistory',
      render: (text: string, record: CustomerWithRisk) => {
        return (
          <Space size="small">
            {record.loanRepaymentHistory.map((payment: number, index: number) => (
              <Tag color={payment === 1 ? 'green' : 'red'} key={index}>
                {payment === 1 ? 'P' : 'M'}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Risk Score',
      key: 'riskScore',
      dataIndex: 'riskScore',
      sorter: (a: CustomerWithRisk, b: CustomerWithRisk) => a.riskScore - b.riskScore,
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score > 70 ? "exception" : (score > 40 ? "normal" : "success")}
          strokeColor={getRiskColor(score)}
        />
      ),
    },
    {
      title: 'Risk Level',
      key: 'riskLevel',
      dataIndex: 'riskLevel',
      sorter: (a: CustomerWithRisk, b: CustomerWithRisk) => {
        const levels: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3, 'N/A': 0 };
        return levels[a.riskLevel] - levels[b.riskLevel];
      },
      render: (level: string) => {
        let color = 'green';
        if (level === 'Medium') {
          color = 'orange';
        } else if (level === 'High') {
          color = 'red';
        }
        return <Tag color={color}>{level}</Tag>;
      },
      filters: [
        { text: 'Low', value: 'Low' },
        { text: 'Medium', value: 'Medium' },
        { text: 'High', value: 'High' },
      ],
      onFilter: (value: any, record: CustomerWithRisk) => record.riskLevel === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Approved') {
          color = 'green';
        } else if (status === 'Rejected') {
          color = 'red';
        }
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Review', value: 'Review' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: any, record: CustomerWithRisk) => record.status === value,
    },
  ];

  // Component for displaying risk factor breakdown
  const RiskFactorsBreakdown = ({ factors }: { factors: any }) => (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text style={{ color: isDarkMode ? '#fff' : undefined }}>Credit Score Impact:</Text>
          <Progress 
            percent={(factors.creditScoreImpact / 40) * 100} 
            format={() => `${factors.creditScoreImpact}/40`}
            status={factors.creditScoreImpact > 20 ? "exception" : "normal"}
          />
        </div>
        <div>
          <Text style={{ color: isDarkMode ? '#fff' : undefined }}>Repayment History Impact:</Text>
          <Progress 
            percent={(factors.repaymentHistoryImpact / 30) * 100} 
            format={() => `${factors.repaymentHistoryImpact}/30`}
            status={factors.repaymentHistoryImpact > 15 ? "exception" : "normal"}
          />
        </div>
        <div>
          <Text style={{ color: isDarkMode ? '#fff' : undefined }}>Loan-to-Income Ratio Impact:</Text>
          <Progress 
            percent={(factors.loanToIncomeRatioImpact / 30) * 100} 
            format={() => `${factors.loanToIncomeRatioImpact}/30`}
            status={factors.loanToIncomeRatioImpact > 15 ? "exception" : "normal"}
          />
        </div>
      </Space>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ color: isDarkMode ? '#fff' : undefined }}>Risk Assessment</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card 
            title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Risk Score Distribution</span>}
            style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskChartData}>
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
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                    border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
                    color: isDarkMode ? '#fff' : undefined
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="customers" 
                  name="Number of Customers" 
                  barSize={60}
                >
                  {riskChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'Low' 
                          ? '#52c41a' 
                          : entry.name === 'Medium' 
                            ? '#faad14' 
                            : '#f5222d'
                      }
                      style={{ filter: isDarkMode ? 'brightness(1.2)' : undefined }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card 
        title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Customer Risk Assessment</span>}
        style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
          <Input
            placeholder="Search by name, ID or risk level"
            prefix={<SearchOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ 
              width: '100%',
              maxWidth: 300,
              backgroundColor: isDarkMode ? '#141414' : undefined,
              color: isDarkMode ? '#fff' : undefined
            }}
          />
        </Space>

        <Table 
          dataSource={filteredCustomers} 
          columns={columns} 
          rowKey="customerId"
          pagination={{ 
            pageSize: 5,
            responsive: true,
            style: { color: isDarkMode ? '#fff' : undefined }
          }}
          scroll={{ x: 'max-content' }}
          style={{ color: isDarkMode ? '#fff' : undefined }}
          expandable={{
            expandedRowRender: record => (
              <Collapse ghost>
                <Panel 
                  header={
                    <span style={{ color: isDarkMode ? '#fff' : undefined }}>
                      Risk Factors Breakdown
                    </span>
                  } 
                  key="1"
                >
                  <RiskFactorsBreakdown factors={record.riskFactors} />
                </Panel>
              </Collapse>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default RiskAssessment;