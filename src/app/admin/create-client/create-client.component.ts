import {Component, OnInit} from '@angular/core';
import {Client} from '../../transaction/transaction';
import {ClientService} from '../clients/client.service';
import {ToastrService} from 'ngx-toastr';
import {debounceTime} from 'rxjs/operators';
import {Subject} from 'rxjs';

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
  submitting = false;
  public is_cooperate = false;
  private _success = new Subject<string>();

  constructor(private clientService: ClientService,
              private toastr: ToastrService) {
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
