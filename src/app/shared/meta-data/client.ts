import {Account} from './account';


export class Client {

	link: string;
	bvn?: number;
	client_type?: number;
	created_at?: string;
	date_of_birth: string;
	accounts?: Account[];
	email?: string;
	gender?: string;
	country?: string;
	first_name: string;
	last_name: string;
	middle_name?: string;
	full_name?: string;
	avatar?: string;
	id?: number;
	is_individual?: boolean;
	marital_status: string;
	nok_full_name: string;
	nok_phone: string;
	occupation: string;
	identification?: string;
	identification_document?: string;
	identification_number?: string;
	cac_document?: string;
	office_address: string;
	phone: string;
	rc_number: string;
	referee_1: string;
	referee_2: string;
	referee_3: string;
	referee_4: string;
	residential_address: string;
	updated_at?: string;
	kyc: KYC;
}


export class KYC {
	id: number;
	status?: boolean;
	awaiting_review?: boolean | number;
	last_reviewed_at?: string;
	last_reviewed_by?: string;
	created_at?: string;
	deleted_at?: string;
}
