import { apiPrivateClient } from '@/lib/api/apiClient';

interface CreateCompanyUserParams {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  company_name: string;
  phone?: string;
  address?: string;
}

interface CreateCompanyUserResponse {
  success: boolean;
  data: {
    msg: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
    account?: {
      account_id: string;
      account_number: string;
      account_name: string;
      associated_company: string;
      security_pin: string;
    };
  };
}

interface AdminTransaction {
  id: string;
  date: string;
  amount: string;
  type: string;
  customer: {
    name: string;
    email: string;
    accountNumber: string;
  };
}

interface AdminStats {
  label: string;
  value: string;
  color: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

interface AdminTransactionResponse {
  success: boolean;
  data: {
    transaction: AdminTransaction;
    msg: string;
  };
}

interface AdminStatsResponse {
  success: boolean;
  data: {
    stats: AdminStats[];
    msg: string;
  };
}

interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    msg: string;
  };
}

/**
 * Fetches the last transaction for the admin dashboard
 */
export const getLastTransaction = async (): Promise<AdminTransactionResponse> => {
  try {
    const response = await apiPrivateClient.get('/admin/last-transaction');
    return response.data;
  } catch (error) {
    console.error('Error fetching last transaction:', error);
    return {
      success: false,
      data: {
        transaction: {
          id: 'TX000000',
          date: new Date().toISOString().split('T')[0],
          amount: '$0.00',
          type: 'unknown',
          customer: {
            name: 'Unknown User',
            email: 'unknown@example.com',
            accountNumber: '****0000'
          }
        },
        msg: 'Error fetching last transaction'
      }
    };
  }
};

/**
 * Fetches system statistics for the admin dashboard
 */
export const getSystemStats = async (): Promise<AdminStatsResponse> => {
  try {
    const response = await apiPrivateClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    return {
      success: false,
      data: {
        stats: [
          { label: 'Total Users', value: '0', color: 'primary.main' },
          { label: 'Total Transactions', value: '0', color: 'success.main' },
          { label: 'Active Accounts', value: '0', color: 'secondary.main' },
          { label: 'Monthly Growth', value: '0%', color: 'warning.main' }
        ],
        msg: 'Error fetching system statistics'
      }
    };
  }
};

/**
 * Fetches recent users for the admin dashboard
 */
export const getRecentUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const response = await apiPrivateClient.get('/admin/recent-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return {
      success: false,
      data: {
        users: [],
        msg: 'Error fetching recent users'
      }
    };
  }
};

/**
 * Creates a new company user with an associated revenue account
 */
export const createCompanyUser = async (params: CreateCompanyUserParams): Promise<CreateCompanyUserResponse> => {
  try {
    const response = await apiPrivateClient.post('/admin/create-company-user', params);
    return response.data;
  } catch (error) {
    console.error('Error creating company user:', error);
    return {
      success: false,
      data: {
        msg: 'Error creating company user. Please try again.'
      }
    };
  }
};
