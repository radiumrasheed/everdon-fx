import {Component, OnInit} from '@angular/core';
import {ClientService} from './client.service';
import {Client} from '../../transaction/transaction';
import {ToastsManager} from 'ng2-toastr';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  providers: [ClientService]
})
export class ClientsComponent implements OnInit {
  clients: Client[];

  constructor(private clientService: ClientService,
              private toastr: ToastsManager) {
  }

  ngOnInit() {
    this.clientService.getClients()
      .subscribe(
        clients => {
          this.clients = clients;
        },
        err => {
        }
      );
  }

}
