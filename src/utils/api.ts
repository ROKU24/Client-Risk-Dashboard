import axios from 'axios';
import { CustomerData } from '../types/customer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50001/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch all customers from the API
 */
export const fetchCustomers = async (): Promise<CustomerData[]> => {
  try {
    const response = await axiosInstance.get('/customers');
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Update a customer's status
 */
export const updateCustomerStatus = async (
  customerId: string, 
  status: 'Review' | 'Approved' | 'Rejected'
): Promise<CustomerData> => {
  try {
    const response = await axiosInstance.put(`/customers/${customerId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw error;
  }
};

/**
 * Send alert for high-risk approval
 */
export const sendHighRiskAlert = async (customerId: string, riskScore: number): Promise<void> => {
  try {
    await axiosInstance.post('/alerts', { customerId, riskScore });
  } catch (error) {
    console.error('Error sending high risk alert:', error);
    throw error;
  }
};