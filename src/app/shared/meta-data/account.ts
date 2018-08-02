export class Account {
	id?: number;
	client_id?: number;
	default?: boolean;
	foreign = false;
	number?: number;
	name?: string;
	bank?: string;

	bank_address?: string;
	swift_code?: string;
	routing_no?: string;
	sort_code?: string;
	iban?: string;
}
