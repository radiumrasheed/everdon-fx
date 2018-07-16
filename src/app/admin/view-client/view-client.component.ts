import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {ClientService} from '../clients/client.service';
import {Client} from '../../shared/meta-data';

@Component({
  selector: 'app-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.css'],
  providers: [ClientService]
})
export class ViewClientComponent implements OnInit {
  public id: string;
  public successMessage: boolean;
  public is_individual: boolean;
  public client = new Client;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
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
        },
        err => {
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
