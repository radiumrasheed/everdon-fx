import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {debounceTime} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';

import {Client, COUNTRIES} from '../meta-data';
import {CreateClientFormService} from './create-client-form.service';


@Component({
	selector: 'app-create-client-form',
	templateUrl: './create-client-form.component.html',
	styleUrls: ['./create-client-form.component.css'],
	providers: [CreateClientFormService]
})
export class CreateClientFormComponent implements OnInit {
	private _success = new Subject<string>();
	@Output() submittedSuccessfully = new EventEmitter<string>();
	client = new Client;
	countries = COUNTRIES;
	successMessage: string;
	staticAlertClosed = false;
	submitting = false;
	is_cooperate = false;


	constructor(private clientService: CreateClientFormService, private toastr: ToastrService) {
	}


	ngOnInit() {
		setTimeout(() => this.staticAlertClosed = true, 20000);

		this._success.subscribe((message) => this.successMessage = message);
		this._success.pipe(
			debounceTime(5000)
		).subscribe(() => this.successMessage = null);
	}


	createClient() {
		this.submitting = true;
		if (this.is_cooperate === false) {
			this.clientService.createIndividualClient(this.client)
				.subscribe(
					client => {
						if (client) {
							this.toastr.success('Individual Client created successfully');
							this.client = new Client();
							this.submittedSuccessfully.emit(client.id + '');
						}
					},
					err => {
						this.toastr.error(err.message || err);
					},
					() => {
						this.submitting = false;
					}
				);
		} else {
			this.clientService.createCooperateClient(this.client)
				.subscribe(
					client => {
						if (client) {
							this.toastr.success('Cooperate Client created successfully');
							this.submittedSuccessfully.emit(client.id + '');
							this.client = new Client();
						}
					},
					err => {
						this.toastr.error(err.message || err);
					},
					() => {
						this.submitting = false;
					}
				);
		}
	}
}
