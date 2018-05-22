import {Component, Input, OnInit} from '@angular/core';
import {Client} from '../../transaction/transaction';
import {ClientService} from '../clients/client.service';
import {ToastsManager} from 'ng2-toastr';
import {debounceTime} from 'rxjs/operators';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.css'],
  providers: [ClientService]
})
export class CreateClientComponent implements OnInit {
  client = new Client;
  successMessage: string;
  staticAlertClosed = false;
  public is_individual: boolean;
  private _success = new Subject<string>();

  constructor(private clientService: ClientService,
              private toastr: ToastsManager) {
  }

  ngOnInit() {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._success.subscribe((message) => this.successMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
  }

  createClient() {
    if (this.is_individual === true) {
      this.clientService.createIndividualClient(this.client)
        .subscribe(
          client => {
            this.toastr.success('Individual Client created successfully').catch();
          },
          err => {
            this.toastr.error(err.message || err).catch();
          }
        );
    } else {
      this.clientService.createCooperateClient(this.client)
        .subscribe(
          client => {
            this.toastr.success('Cooperate Client created successfully').catch();
          },
          err => {
            this.toastr.error(err.message || err).catch();
          }
        );
    }
  }


}
