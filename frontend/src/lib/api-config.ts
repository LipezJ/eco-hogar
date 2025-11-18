/**
 * Host base de la API; configurado vía VITE_API_URL (default localhost:3000).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API Endpoints preconstruidos.
 */
export const API_ENDPOINTS = {
  accounts: `${API_BASE_URL}/api/accounts`,
  movements: `${API_BASE_URL}/api/movements`,
  bills: `${API_BASE_URL}/api/bills`,
  debts: `${API_BASE_URL}/api/debts`,
  payments: `${API_BASE_URL}/api/payments`,
  auth: `${API_BASE_URL}/api/auth`,
  uploads: `${API_BASE_URL}/api/uploads`,
  cdts: `${API_BASE_URL}/api/cdts`,
  budget: `${API_BASE_URL}/api/settings/budget`,
  notifications: `${API_BASE_URL}/api/notifications`,
} as const;
