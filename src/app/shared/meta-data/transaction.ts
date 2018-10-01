import { Client } from './client';
import { Account } from './account';
import { Event } from './event';
import { User } from './user';
import { _TYPE, NGN } from './constant';


export class Transaction {
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
	country?: string;
	created_at?: string;
	dynamic_product?: any;
	events: Event[];
	fixed_product?: number;
	foreign?: boolean;
	full_name: string;
	funds_paid?: boolean;
	funds_received?: boolean;
	iban?: string;
	id: number;
	initiated_at?: number;
	initiated_by?: number | User;
	is_domiciliary?: boolean;
	kyc_check?: boolean;
	link?: string;
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


	private _buying_product_id?: number;


	get buying_product_id(): number {
		return this._buying_product_id;
	}


	set buying_product_id(value: number) {
		this._buying_product_id = value;
		this.setTransactionType();
		this.setCurrencyRate();
	}


	private _local_rate?: any;


	get local_rate(): any {
		return this._local_rate;
	}


	set local_rate(value: any) {
		this._local_rate = value;
		this.setRate(value);
		this.setCurrencyRate();
	}


	private _selling_product_id?: number;


	get selling_product_id(): number {
		return this._selling_product_id;
	}


	set selling_product_id(value: number) {
		this._selling_product_id = value;
		this.setTransactionType();
		this.setCurrencyRate();
	}


	private _transaction_type_id?: number | string;


	get transaction_type_id(): number | string {
		return this._transaction_type_id;
	}


	set transaction_type_id(value: number | string) {
		this._transaction_type_id = value;
	}


	constructor() {
		this.selling_product_id = NGN;
		this.country = 'Nigeria';
		this.funds_paid = false;
		this.foreign = false;
		this.funds_received = false;
	}


	public static isLocal(currency: number | string): boolean {
		return currency == NGN;
	}


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


	setRate(value: number): void {
		switch (true) {
			case Transaction.isLocal(this.selling_product_id):
				this.rate = value;
				break;

			case Transaction.isLocal(this.buying_product_id):
				this.rate = 1 / value;
				break;

			default:
				this.rate = value;
				break;

		}
	}


	setCurrencyRate(): void {
		switch (true) {
			case Transaction.isLocal(this.selling_product_id):
				this.fixed_product = this.selling_product_id;
				this.dynamic_product = this.buying_product_id;
				break;

			case Transaction.isLocal(this.buying_product_id):
				this.fixed_product = this.buying_product_id;
				this.dynamic_product = this.selling_product_id;
				break;

			default:
				this.fixed_product = this.selling_product_id;
				this.dynamic_product = this.buying_product_id;
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
