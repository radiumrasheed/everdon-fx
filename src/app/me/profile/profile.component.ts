import {Component, OnInit} from '@angular/core';
import {ProfileService} from './profile.service';
import {Client} from '../../transaction/transaction';
import {ToastsManager} from 'ng2-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [ProfileService]
})
export class ProfileComponent implements OnInit {
  client: Client;
  public is_individual: boolean;

  constructor(private profileService: ProfileService, private toastr: ToastsManager) {
  }

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.profileService.getMyProfile()
      .subscribe(
        client => {
          if (client) {
            this.client = client;

            if (this.client.client_type === 1) {
              this.is_individual = true;
            } else if (this.client.client_type === 2) {
              this.is_individual = false;
            }
          }
        },
        () => {
        },
        () => {
        }
      );
  }

  updateProfile() {
    this.profileService.updateProfile(this.client, this.client.id)
      .subscribe(
        client => {
          this.toastr.success('Profile updated successfully').catch();
        },
        () => {
        },
        () => {
          this.getProfile();
        }
      );
  }

}
