import {Component, OnInit} from '@angular/core';
import {CalendarPipe} from 'angular2-moment';

import {Client} from '../../shared/meta-data';
import {ClientService} from './client.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  providers: [ClientService, CalendarPipe]
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
        filter: true,
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
      columnTitle: '',
    }
  };

  constructor(private clientService: ClientService,
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
            return client;
          });
        }
      );
  }

}
