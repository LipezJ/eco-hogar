// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  accounts: `${API_BASE_URL}/api/accounts`,
  movements: `${API_BASE_URL}/api/movements`,
  bills: `${API_BASE_URL}/api/bills`,
  debts: `${API_BASE_URL}/api/debts`,
  payments: `${API_BASE_URL}/api/payments`,
  cdts: `${API_BASE_URL}/api/cdts`,
} as const;
