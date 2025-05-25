import axios from 'axios';

// API key is stored in environment variables
const API_KEY = import.meta.env.VITE_PUSH_IN_PAY_API_KEY || '30776|Qy1j2nT3IWZxauckYvanoQKszXJkM4CjtcAaeAnVcec772d3';
const BASE_URL = 'https://api.pushinpay.com.br/v1';

// Configure axios instance with base settings
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

interface PixChargeRequest {
  reference_id: string;
  customer: {
    name: string;
    email: string;
    tax_id?: string; // CPF
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit_amount: number;
  }>;
  amount: {
    value: number;
  };
  description?: string;
  expiration_date?: string; // ISO date string
}

interface PixChargeResponse {
  id: string;
  reference_id: string;
  status: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
    tax_id?: string;
    phone?: string;
  };
  qr_code: {
    text: string;
    image: string;
  };
  amount: {
    value: number;
    currency: string;
  };
  pix_key: string;
  txid: string;
}

interface PaymentStatusResponse {
  id: string;
  reference_id: string;
  status: string;
  created_at: string;
  paid_at?: string;
}

/**
 * Create a new PIX charge
 */
export const createPixCharge = async (data: PixChargeRequest): Promise<PixChargeResponse> => {
  try {
    const response = await api.post('/charges', data);
    return response.data;
  } catch (error) {
    console.error('Error creating PIX charge:', error);
    throw error;
  }
};

/**
 * Get payment status by transaction ID
 */
export const getPaymentStatus = async (txid: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await api.get(`/charges/${txid}`);
    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

/**
 * Poll for payment status updates
 * @param txid Transaction ID to check
 * @param callback Function to call when payment is confirmed
 * @param interval Polling interval in milliseconds
 * @param timeout Maximum time to poll in milliseconds
 */
export const pollPaymentStatus = (
  txid: string,
  callback: (status: string) => void,
  interval = 5000,
  timeout = 900000 // 15 minutes
): { stop: () => void } => {
  const startTime = Date.now();
  let timerId: number | undefined;
  
  const checkStatus = async () => {
    try {
      const response = await getPaymentStatus(txid);
      
      // If payment is confirmed or expired
      if (response.status === 'PAID' || response.status === 'EXPIRED') {
        callback(response.status);
        clearInterval(timerId);
        return;
      }
      
      // Check if we've exceeded the timeout
      if (Date.now() - startTime > timeout) {
        clearInterval(timerId);
        callback('TIMEOUT');
        return;
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
    }
  };
  
  timerId = setInterval(checkStatus, interval) as unknown as number;
  
  return {
    stop: () => {
      if (timerId !== undefined) {
        clearInterval(timerId);
      }
    }
  };
};