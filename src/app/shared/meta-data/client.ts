import { Account } from './account';


export class Client {
	accounts?: Account[];
	avatar?: string;
	bvn?: number;
	cac_document?: string;
	client_type?: number;
	country?: string;
	created_at?: string;
	date_of_birth: string;
	email?: string;
	first_name: string;
	full_name?: string;
	gender?: string;
	id?: number;
	identification?: string;
	identification_document?: string;
	identification_number?: string;
	is_individual?: boolean;
	kyc: KYC;
	last_name: string;
	link: string;
	marital_status: string;
	middle_name?: string;
	nok_full_name: string;
	nok_phone: string;
	occupation: string;
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


export class KYC {
	awaiting_review?: boolean | number;
	created_at?: string;
	deleted_at?: string;
	id: number;
	last_reviewed_at?: string;
	last_reviewed_by?: string;
	status?: boolean;
}
