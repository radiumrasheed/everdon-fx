export class Client {
  link: string;
  bvn?: number;
  client_type?: number;
  created_at?: string;
  date_of_birth: string;
  accounts?: Account[];
  email?: string;
  full_name: string;
  id?: number;
  is_individual?: boolean;
  marital_status: string;
  nok_full_name: string;
  nok_phone: string;
  occupation: string;
  identification: string;
  identification_number: string;
  // identification_image: any;
  office_address: string;
  phone: string;
  rc_number: string;
  referee_1: string;
  referee_2: string;
  referee_3: string;
  referee_4: string;
  residential_address: string;
  updated_at?: string;
}

export class User {
  id?: string;
  name?: string;
  email?: string;
}

export class Event {
  action: string;
  amount: number;
  created_at: string;
  comment?: string;
  done_at: string;
  done_by: User;
  id: number;
  rate: number;
  transaction_id: number;
  transaction_status_id: number;
  updated_at: string;
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
  account: Account;
  calculated_amount: number;
  account_id: number;
  approved_at?: string;
  approved_by?: number;
  client?: Client;
  client_id: number;
  closed_at?: string;
  closed_by?: number;
  created_at?: string;
  comment?: string;
  org_account_id?: number;
  events: Event[];
  id: number;
  initiated_at?: number;
  initiated_by?: number;
  link?: string;
  buying_product_id?: number;
  selling_product_id?: number;
  rate?: number;
  reviewed_at?: string;
  reviewed_by?: number;
  transaction_ref?: string;
  transaction_mode_id?: number;
  transaction_status_id?: number;
  transaction_type_id?: number;
  updated_at?: string;
  condition?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  bvn?: string;

  full_name: string;
}

export class Organization {
  id?: number;
  name?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  created_at?: string;
  updated_at?: string;

}


export const PRODUCTS: Product[] = [
  {id: 1, name: 'USD', value: 'usd', description: 'US Dollar', sign: '$'},
  {id: 2, name: 'EUR', value: 'eur', description: 'European Euro', sign: '€'},
  {id: 3, name: 'GBP', value: 'gbp', description: 'British Pound', sign: '£'},
  {id: 4, name: 'NGN', value: 'ngn', description: 'Nigerian Naira', sign: '₦'}
];


export const ORGANIZATIONS: Organization[] = [
  {id: 1, name: 'VFD Groups', account_name: 'Internals', account_number: '0101020102', 'bank_name': 'VFD'},
  {id: 2, name: 'Germaine Motors', account_name: 'Sister', account_number: '88283047203', 'bank_name': 'VFD'}
];

