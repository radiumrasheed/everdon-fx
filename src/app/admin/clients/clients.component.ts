import { Component, OnInit } from '@angular/core';
import { CalendarPipe } from 'angular2-moment';

import { Client } from '../../shared/meta-data';
import { CreateClientFormService } from '../../shared/create-client-form/create-client-form.service';


@Component({
	selector: 'app-clients',
	templateUrl: './clients.component.html',
	styleUrls: ['./clients.component.css'],
	providers: [CreateClientFormService, CalendarPipe]
})
export class ClientsComponent implements OnInit {
	clients: Client[];

	table_settings = {
		columns: {
			link: {
				title: 'Action',
				filter: false,
				type: 'html'
			},
			full_name: {
				title: 'Full Name',
				filter: true
			},
			phone: {
				title: 'Phone',
				filter: true
			},
			email: {
				title: 'Email',
				filter: true
			},
			updated_at: {
				title: 'Last Updated',
				filter: true,
				valuePrepareFunction: (val) => {
					return this.calendarPipe.transform(val);
				}
			}
		},
		noDataMessage: 'No Customers Yet',
		actions: {
			add: false,
			edit: false,
			delete: false,
			columnTitle: ''
		}
	};


	constructor(private clientService: CreateClientFormService,
							private calendarPipe: CalendarPipe) {
	}


	ngOnInit() {
		this.getClients();
	}


	getClients() {
		this.clientService.getClients()
			.subscribe(
				clients => {
					this.clients = clients.map<Client>(client => {
						client.link = `<a href="/#/admin/customer/${client.id}">View Details</a>`;
						client.full_name = `${client.first_name} ${client.last_name}`;
						return client;
					});
				}
			);
	}

}
