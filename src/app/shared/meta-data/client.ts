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
	identification: string;
	identification_number: string;
	office_address: string;
	phone: string;
	rc_number: string;
	referee_1: string;
	referee_2: string;
	referee_3: string;
	referee_4: string;
	residential_address: string;
	updated_at?: string;
	kyc: any;
}
