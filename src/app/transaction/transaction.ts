export class Client {
  bvn: number;
  client_type: number;
  created_at: string;
  date_of_birth: string;
  email: string;
  full_name: string;
  id: number;
  marital_status: string;
  nok_full_name: string;
  occupation: string;
  office_address: string;
  phone: string;
  rc_number: string;
  referee_1: string;
  referee_2: string;
  referee_3: string;
  referee_4: string;
  residential_address: string;
  updated_at: string;
}

export class Event {
  action: string;
  amount: number;
  created_at: string;
  done_at: string;
  done_by: number;
  id: number;
  rate: number;
  transaction_id: number;
  transaction_status_id: number;
  updated_at: string;
  wacc: number;
}

export class Account {
  id?: number;
  client_id?: number;
  default?: boolean;
  number?: number;
  name?: string;
  bank?: string;
  bvn?: string;
}


export class Product {
  id?: number;
  name?: string;
  value?: string;
  desc?: string;
  description?: string;
  sign?: string;
  created_at?: string;
  updated_at?: string;
}

export class Transaction {
  amount: number;
  calculated_amount: number;
  account_id: number;
  approved_at?: string;
  approved_by?: number;
  client?: Client;
  client_id: number;
  closed_at?: string;
  closed_by?: number;
  created_at?: string;
  events: Event[];
  id: number;
  initiated_at?: number;
  initiated_by?: number;
  buying_product_id?: number;
  selling_product_id?: number;
  rate?: number;
  reviewed_at?: string;
  reviewed_by?: number;
  transaction_mode_id?: number;
  transaction_status_id?: number;
  transaction_type_id?: number;
  updated_at?: string;
}


export const CURRENCY_LIST: Product[] = [
  {id: 1, name: 'USD', value: 'usd', description: 'US Dollar', sign: '$'},
  {id: 2, name: 'EUR', value: 'eur', description: 'Euro', sign: '€'},
  {id: 3, name: 'GBP', value: 'gbp', description: 'British pounds', sign: '£'},
  {id: 4, name: 'NGN', value: 'ngn', description: 'Nigerian Naira', sign: '₦'}
];
