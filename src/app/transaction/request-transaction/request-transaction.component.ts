import {Component, OnInit} from '@angular/core';
import {Transaction} from '../../shared/meta-data';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../services/auth/auth.service';

@Component({
	selector: 'app-request-transaction',
	templateUrl: './request-transaction.component.html',
	styleUrls: ['./request-transaction.component.css']
})
export class RequestTransactionComponent implements OnInit {
	roles$: Observable<string>;
	role: string;

	transaction: Transaction;

	constructor(private auth: AuthService) {
	}

	ngOnInit() {
		if (!this.transaction) {
			this.transaction = new Transaction();
		}

		this.roles$ = this.auth.roles;
		this.roles$.subscribe(roles => this.role = roles[0]);
	}

	public onSubmittedSuccessfully($event: any) {
		//
	}
}
