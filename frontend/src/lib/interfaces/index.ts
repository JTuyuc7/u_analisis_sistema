
export interface AuthInterface {
  customer_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  admin: boolean
  created_at: string
  updated_at: string
}

export interface Card {
  card_id: number;
  card_number: string;
  expiration_date: string;
  status: string;
}

export interface Account {
  account_id: number;
  account_number: string;
  account_type: string;
  account_name: string;
  balance: number;
  status: string;
  created_at: string;
  card_count: number;
  cards: Card[];
}

export interface SignupUserState {
  state: {
    name: string
    last_name: string
    email: string
    phone: string
    address: string
    password: string
    confirm_pass: string
    msg?: string
  },
  errors?: {
    name?: string
    last_name?: string
    email?: string
    phone?: string
    address?: string
    password?: string
    confirm_pass?: string
  },
  success?: boolean
}

export interface createAccountState {
  state: {
    accountType: string
    accountName: string
    pin: string
    msg?: string
  },
  errors?: {
    accountType?: string
    accountName?: string
    pin?: string
  },
  success?: boolean
}

export interface IAccountDataProps {
  account_id: number;
  account_name: string;
  account_number: string;
  account_type: string;
  balance: number;
  created_at: string;
  status: string;
}

export interface IListAccountProps {
  success: boolean
  data: { 
    accounts?: IAccountDataProps[]
    msg: string
  }
}

export interface ISingleAccountProps {
  success: boolean
  data: {
    account?: IAccountDataProps
    msg: string
  }
}

export interface IRenderContent {
  title: string
  children: React.ReactNode
  titleColor?: string
}

export interface AuthState {
  isAuthenticated: null | boolean;
  user: AuthInterface;
  token: string 
}

export interface IAcccountState {
  accounts: IAccountDataProps[],
  loading: boolean,
  error: string | null,
  success: boolean,
}

export interface ISingleAccountFinderProps { 
  account_number: string
  account_type: string
  customer_id: number
  first_name: string
  last_name: string
}
export interface IAccountFinderProps {
  success: boolean
  error: boolean
  data: {
    account: ISingleAccountFinderProps 
    msg: string
  }
}
export interface TransferFormData {
  account: { account_id: string; account_number: string, availableAmount: string };
  toAccountId: string;
  amount: string;
  description: string;
  toAccountDetails: { accountId: string, toAccountName: string }
}

export interface FormErrors {
  fromAccountId?: string;
  toAccountId?: string;
  amount?: string;
  description?: string;
}