import {Client} from './client';
import {Account} from './account';
import {Event} from './event';
import {User} from './user';
import {_TYPE, NGN} from './constant';


export class Transaction {
	private _buying_product_id?: number;


	get buying_product_id(): number {
		return this._buying_product_id;
	}


	set buying_product_id(value: number) {
		this._buying_product_id = value;
		this.setTransactionType();
	}


	private _selling_product_id? = NGN;


	get selling_product_id(): number {
		return this._selling_product_id;
	}


	set selling_product_id(value: number) {
		this._selling_product_id = value;
		this.setTransactionType();
	}


	private _transaction_type_id?: number | string;


	get transaction_type_id(): number | string {
		return this._transaction_type_id;
	}


	set transaction_type_id(value: number | string) {
		this._transaction_type_id = value;
	}


	account: Account;
	account_id: number;
	account_name?: string;
	account_number?: string;
	aml_check?: boolean;
	amount: number;
	approved_at?: string;
	approved_by?: number | User;
	bank_name?: string;
	bvn?: string;
	calculated_amount: number;
	client?: Client;
	client_id: number;
	closed_at?: string;
	closed_by?: number;
	comment?: string;
	condition?: string;
	country? = 'Nigeria';
	created_at?: string;
	events: Event[];
	foreign? = false;
	full_name: string;
	funds_paid? = false;
	funds_received? = false;
	iban?: string;
	id: number;
	initiated_at?: number;
	initiated_by?: number | User;
	is_domiciliary?: boolean;
	kyc_check?: boolean;
	link?: string;
	local_rate?: any;
	org_account_id?: number;
	rate?: any;
	referrer?: string;
	reviewed_at?: string;
	reviewed_by?: number;
	routing_no?: string;
	sort_code?: string;
	swap_charges?: number;
	swift_code?: string;
	transaction_mode_id?: number | string;
	transaction_ref?: string;
	transaction_status_id?: number | string;
	updated_at?: string;


	private setTransactionType(value: number | string = null) {
		switch (true) {
			case this.buying_product_id == this.selling_product_id:
				this.transaction_type_id = _TYPE.CROSS;
				break;

			case this.buying_product_id == NGN:
				this.transaction_type_id = _TYPE.PURCHASE;
				break;

			case this.selling_product_id == NGN:
				this.transaction_type_id = _TYPE.SALES;
				break;

			case this.buying_product_id != NGN && this.selling_product_id != NGN:
				this.transaction_type_id = _TYPE.SWAP;
				break;

			case this.selling_product_id == null:
				this.transaction_type_id = _TYPE.EXPENSES;
				break;

			default:
				this.transaction_type_id = value;
		}
	}
}


export class RefundTransaction extends Transaction {
	originating_id: number;


	constructor(transaction: Transaction) {
		super();
		this.transaction_type_id = NGN;
		this.originating_id = transaction.id;
		this.client_id = transaction.client_id;
		this.client = transaction.client;
		this.buying_product_id = transaction.selling_product_id;
		this.selling_product_id = transaction.buying_product_id;
		this.transaction_mode_id = transaction.transaction_mode_id;
		this.account_id = transaction.account_id;
		this.amount = transaction.calculated_amount;
		this.referrer = transaction.referrer;
	}
}
