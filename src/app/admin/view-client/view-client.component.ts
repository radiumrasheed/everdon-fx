import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {ClientService} from '../clients/client.service';
import {Client} from '../../transaction/transaction';

@Component({
  selector: 'app-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.css'],
  providers: [ClientService]
})
export class ViewClientComponent implements OnInit {
  public id: string;
  public client = new Client;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private toastr: ToastsManager) {

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
        },
        err => {
        }
      );
  }

  updateClient() {
    //
  }
}
