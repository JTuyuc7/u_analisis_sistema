
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