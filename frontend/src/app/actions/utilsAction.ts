'use server'
import { IAccountFinderProps, IListAccountProps, ISingleAccountFinderProps, ITransactionStateResponse } from "@/lib/interfaces";
import axios from "axios";
import { cookies } from "next/headers";

const backendURL = process.env.NEXT_PUBLIC_API_URL || '';

export const getTokenFromCookie = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value || '';
  return token;
}

export const injectHeaderToken = async () => {
  const token = await getTokenFromCookie();
  const config = {
    headers: {
      'Authorization': `${token}`,
      'Content-Type': 'application/json',
    }
  }
  return config;
}

export async function getAllUserAccount(): Promise<IListAccountProps> {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return {
        success: false,
        data: {
          accounts: [],
          msg: "No token found",
        }
      };
    }

    // Create a request with the token
    const response = await axios.get(`${backendURL}/accounts/customer/list`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      return {
        success: false,
        data: {
          accounts: [],
          msg: "Error fetching user accounts",
        },
      };
    }

    return {
      success: true,
      data: {
        accounts: response.data.accounts,
        msg: response.data.msg
      },
    };
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return {
      success: false,
      data: {
        accounts: [],
        msg: "Error fetching user accounts",
      },
    };
  }
}

export async function getAccountByAccountNumber(state: IAccountFinderProps, formData: FormData, accountId: string,): Promise<IAccountFinderProps> {
  try {
    console.log('from action getAccountByAccountNumber')
    const token = await getTokenFromCookie(); 
    if (!token) {
      return {
        success: false,
        error: true,
        data: {
          account: {} as ISingleAccountFinderProps,
          msg: "No token found",
        }
      };
    }

    // Create a request with the token
    const response = await axios.get(`${backendURL}/accounts/${accountId}`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status !== 200) {
      return {
        success: false,
        error: true,
        data: {
          account: {} as ISingleAccountFinderProps,
          msg: "Please check the account number",
        },
      };
    }

    return {
      success: true,
      error: false,
      data: {
        account: response.data.account,
        msg: response.data.message
      },
    };
  } catch (error: unknown ) {
    const errorMessage = error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data ?
      error.response.data.message as string :
      "An unexpected error occurred";
    return {
      success: false,
      error: true,
      data: {
        account: {} as ISingleAccountFinderProps,
        msg: errorMessage,
      },
    };
  }
}

export async function getBalanceToTransfer(accountNumber: string): Promise<Record<string, string>> {

  try {
    const token = await getTokenFromCookie();
    if (!token) {
      throw new Error("No token found");
    }


    const response = await axios.get(`${backendURL}/accounts/balance/${accountNumber}`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status !== 200) {
      throw new Error("Error fetching balance account");
    }
    return {
      message: response.data.message,
      balance: response.data.balance,
    };
  } catch (error) {
    console.error("Error fetching balance account:", error);
    throw new Error("Error fetching balance account");
  }
}

export async function getCardByAccountNumber(accountNumber: string) {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return {
        success: false,
        data: {
          card: null,
          msg: "No token found",
        }
      };
    }

    const response = await axios.get(`${backendURL}/accounts/card/${accountNumber}`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      return {
        success: false,
        data: {
          card: null,
          msg: "Error fetching card details",
        },
      };
    }

    return {
      success: true,
      data: {
        card: response.data.card,
        msg: response.data.message
      },
    };
  } catch (error) {
    console.error("Error fetching card details:", error);
    return {
      success: false,
      data: {
        card: null,
        msg: "Error fetching card details",
      },
    };
  }
}

export async function getAllUserTransactions(): Promise<ITransactionStateResponse> {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return {
        success: false,
        data: { 
          transactions: [],
          msg: "No token found",
        }
      };
    }

    const response = await axios.get(`${backendURL}/accounts/customer/transactions`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });

    // console.log("🚀 ~ getAllUserTransactions ~ response:", response.data)

    if (response.status !== 200) {
      return {
        success: false,
        data: {
          transactions: [],
          msg: "Error fetching user transactions",
        },
      };
    }

    return {
      success: true,
      data: {
        transactions: response.data.transactionList,
        msg: response.data.msg
      },
    };
  } catch (error : unknown) {
    console.error("Error fetching user transactions:", error);
    const errorMessage = error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data ?
      error.response.data.message as string :
      "An unexpected error occurred";
    return {
      success: false,
      data: {
        transactions: [],
        msg: errorMessage,
      },
    };
  }
}

export async function getTransactionByAccountNumber (accountNumber: string) { 
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return {
        success: false,
        data: {
          transactions: [],
          msg: "No token found",
        }
      };
    }

    const response = await axios.get(`${backendURL}/accounts/${accountNumber}/transactions`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      return {
        success: false,
        data: {
          transactions: [],
          msg: "Error fetching transactions",
        },
      };
    }

    return {
      success: true,
      data: {
        transactions: response.data.transactions,
        msg: response.data.msg
      },
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    const errorMessage = error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data ?
      error.response.data.message as string :
      "An unexpected error occurred";
    return {
      success: false,
      data: {
        transactions: [],
        msg: errorMessage,
      },
    };
  }
}