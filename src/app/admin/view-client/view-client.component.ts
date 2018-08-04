import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {CreateClientFormService} from '../../shared/create-client-form/create-client-form.service';
import {Client} from '../../shared/meta-data';

@Component({
	selector: 'app-view-client',
	templateUrl: './view-client.component.html',
	styleUrls: ['./view-client.component.css'],
	providers: [CreateClientFormService]
})
export class ViewClientComponent implements OnInit {
	public id: string;
	public successMessage: boolean;
	public client: Client;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private clientService: CreateClientFormService,
		private toastr: ToastrService) {

	}

	ngOnInit() {
		// Get Transaction Id from route...
		this.route.paramMap
			.subscribe(params => {
				this.id = params.get('id');
				this.getClient(params.get('id'));
			});
	}

	getClient(id: string): void {
		this.clientService.getClient(id)
			.subscribe(
				client => {
					this.client = client;
				}
			);
	}

	updateClient() {
		this.clientService.updateClient(this.client.id, this.client)
			.subscribe(
				client => {
					if (client) {
						this.client = client;
						this.toastr.success('Customer details updated successfully');
					}
				}
			);
	}
}
