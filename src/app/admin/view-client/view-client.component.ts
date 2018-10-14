import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CreateClientFormService } from '../../shared/create-client-form/create-client-form.service';
import { Client } from '../../shared/meta-data';
import { finalize } from 'rxjs/operators';


@Component({
	selector: 'app-view-client',
	templateUrl: './view-client.component.html',
	styleUrls: ['./view-client.component.css'],
	providers: [CreateClientFormService]
})
export class ViewClientComponent implements OnInit {
	private formData: FormData = new FormData();
	loading: boolean;
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
				this.getClient();
			});
	}


	private constructFormData() {
		Object.keys(this.client).forEach(key => {
			if (this.client[key]) {
				this.formData.append(key, this.client[key]);
			}
		});
	}


	getClient() {
		delete this.client;
		this.clientService.getClient(this.id)
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


	validateKYC(): void {
		if (!this.loading) {
			this.loading = true;
			this.client.kyc.status = !this.client.kyc.status;
			this.clientService.validateKYC(this.client.id, this.client.kyc)
				.pipe(finalize(() => this.loading = false))
				.subscribe(
					client => {
						if (client) {
							this.client = client;
							this.toastr.success('Customer KYC validated successfully');
						}
					}
				);
		}
	}


	fileChangeEvent(fileInput: any, name: string) {
		this.formData.append(name, fileInput.target.files[0]);
	}


	updateIdentity() {
		this.constructFormData();
		this.clientService.updateIdentity(this.formData, this.client.id)
			.subscribe(
				client => {
					if (client) {
						this.toastr.success('Identity Profile updated successfully');
					}
				},
				() => {
				},
				() => {
					this.formData = new FormData();
					this.getClient();
				}
			);
	}
}
