import {User} from './user';


export class Event {
	action: string;
	amount: number;
	comment?: string;
	created_at: string;
	done_at: string;
	done_by: User;
	id: number;
	rate: number;
	transaction_id: number;
	transaction_status_id: number;
	updated_at: string;
}
