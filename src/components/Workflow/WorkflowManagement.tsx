import React, { useMemo, useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Modal, 
  Form, 
  Select, 
  Input, 
  notification, 
  Spin, 
  Typography,
  Progress,
  Badge,
  Alert
} from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, AlertOutlined } from '@ant-design/icons';

// Types
import { CustomerData } from '../../types/customer';

// Utils
import { calculateAllRiskScores, getRiskColor } from '../../utils/riskScoring';

const { Title, Text } = Typography;
const { Option } = Select;

interface WorkflowManagementProps {
  customerData: CustomerData[];
  loading: boolean;
  updateCustomerStatus: (customerId: string, newStatus: 'Review' | 'Approved' | 'Rejected') => Promise<boolean>;
  isDarkMode?: boolean;
}

interface CustomerWithRisk extends CustomerData {
  riskScore: number;
  riskLevel: string; // Changed from union type to string
}

const WorkflowManagement: React.FC<WorkflowManagementProps> = ({ 
  customerData, 
  loading, 
  updateCustomerStatus,
  isDarkMode = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerData | null>(null);
  const [form] = Form.useForm();

  // Calculate risk scores
  const riskScores = useMemo(() => {
    return calculateAllRiskScores(customerData);
  }, [customerData]);

  // Combine customer data with risk scores
  const customersWithRisk = useMemo(() => {
    return customerData.map(customer => {
      const risk = riskScores.find(score => score.customerId === customer.customerId);
      return {
        ...customer,
        riskScore: risk?.score || 0,
        riskLevel: risk?.level || 'N/A'
      };
    });
  }, [customerData, riskScores]);

  // Handle updating customer status
  const handleUpdateStatus = async (values: { status: 'Review' | 'Approved' | 'Rejected'; notes: string }) => {
    if (!currentCustomer) return;
    
    try {
      const success = await updateCustomerStatus(currentCustomer.customerId, values.status);
      
      if (success) {
        // Check if the customer is high risk and status is Approved
        const customerRisk = riskScores.find(score => score.customerId === currentCustomer.customerId);
        if (customerRisk && customerRisk.score > 70 && values.status === 'Approved') {
          // Simulate sending an alert
          notification.warning({
            message: 'High Risk Alert',
            description: `Alert: You've approved ${currentCustomer.name} who has a high risk score of ${customerRisk.score}. This has been logged for review.`,
            duration: 0, // Don't auto-dismiss
            icon: <AlertOutlined style={{ color: '#ff4d4f' }} />,
          });
          
          // In a real app, we would make an API call to /alerts
          console.log('Alert triggered for high-risk approved customer:', currentCustomer.customerId);
        }
        
        // Show success notification
        notification.success({
          message: 'Status Updated',
          description: `${currentCustomer.name}'s status has been updated to ${values.status}.`,
        });
        
        // Reset and close modal
        form.resetFields();
        setIsModalVisible(false);
      } else {
        notification.error({
          message: 'Update Failed',
          description: 'There was an error updating the customer status.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Update Failed',
        description: 'There was an error updating the customer status.',
      });
    }
  };

  // Open modal with customer data
  const openStatusModal = (customer: CustomerData) => {
    setCurrentCustomer(customer);
    form.setFieldsValue({ status: customer.status, notes: '' });
    setIsModalVisible(true);
  };

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
        let icon;
        let color;
        
        if (status === 'Review') {
          icon = <SyncOutlined spin />;
          color = 'processing';
        } else if (status === 'Approved') {
          icon = <CheckCircleOutlined />;
          color = 'success';
        } else if (status === 'Rejected') {
          icon = <CloseCircleOutlined />;
          color = 'error';
        }
        
        return (
          <Badge status={color as any} text={status} />
        );
      },
      filters: [
        { text: 'Review', value: 'Review' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: any, record: CustomerWithRisk) => record.status === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: CustomerData) => (
        <Button 
          type="primary" 
          onClick={() => openStatusModal(record)}
        >
          Update Status
        </Button>
      ),
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
      <Title level={2} style={{ color: isDarkMode ? '#fff' : undefined }}>Workflow Management</Title>
      
      <Card 
        title={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Customer Workflow</span>}
        style={{ backgroundColor: isDarkMode ? '#1f1f1f' : undefined }}
      >
        <Table 
          dataSource={customersWithRisk} 
          columns={columns.map(col => ({
            ...col,
            ...(col.title && {
              title: <span style={{ color: isDarkMode ? '#fff' : undefined }}>{col.title}</span>
            })
          }))} 
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
      
      {/* Status Update Modal */}
      <Modal
        title={
          <span style={{ color: isDarkMode ? '#fff' : undefined }}>
            Update Status: {currentCustomer?.name}
          </span>
        }
        open={isModalVisible}
        okText="Update"
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        style={{ 
          color: isDarkMode ? '#fff' : undefined
        }}
        styles={{
          content: {
            backgroundColor: isDarkMode ? '#1f1f1f' : undefined,
          },
          header: {
            backgroundColor: isDarkMode ? '#1f1f1f' : undefined,
          },
          body: {
            backgroundColor: isDarkMode ? '#1f1f1f' : undefined,
          },
          footer: {
            backgroundColor: isDarkMode ? '#1f1f1f' : undefined,
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStatus}
        >
          <Form.Item
            name="status"
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Status</span>}
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              style={{ 
                backgroundColor: isDarkMode ? '#141414' : undefined,
                color: isDarkMode ? '#fff' : undefined
              }}
            >
              <Option value="Review">Under Review</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Notes</span>}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Add notes about this decision..." 
              style={{ 
                backgroundColor: isDarkMode ? '#141414' : undefined,
                color: isDarkMode ? '#fff' : undefined
              }}
            />
          </Form.Item>
          
          {currentCustomer && riskScores.find(score => 
            score.customerId === currentCustomer.customerId && score.level === 'High'
          ) && (
            <div style={{ marginBottom: 16 }}>
              <Alert
                message="High Risk Customer"
                description="This customer has a high risk score. Please review carefully before approval."
                type="warning"
                showIcon
              />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowManagement;