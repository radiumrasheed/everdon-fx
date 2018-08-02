import {Client} from './client';
import {Account} from './account';
import {Event} from './event';

export class Transaction {
	amount: number;
	account: Account;
	calculated_amount: number;
	account_id: number;
	approved_at?: string;
	approved_by?: number;
	client?: Client;
	foreign? = false;
	client_id: number;
	closed_at?: string;
	closed_by?: number;
	created_at?: string;
	country? = 'Nigeria';
	comment?: string;
	org_account_id?: number;
	events: Event[];
	id: number;
	initiated_at?: number;
	initiated_by?: number;
	link?: string;
	buying_product_id?: number;
	selling_product_id?: number;
	rate?: any;
	referrer?: string;
	reviewed_at?: string;
	reviewed_by?: number;
	transaction_ref?: string;
	transaction_mode_id?: number | string;
	transaction_status_id?: number | string;
	transaction_type_id?: number | string;
	updated_at?: string;
	condition?: string;
	bank_name?: string;
	account_name?: string;
	account_number?: string;
	bvn?: string;

	swap_charges?: number;
	funds_received?: boolean;
	funds_paid?: boolean;
	aml_check?: boolean;
	kyc_check?: boolean;

	swift_code?: string;
	iban?: string;
	sort_code?: string;
	routing_no?: string;

	full_name: string;
}
