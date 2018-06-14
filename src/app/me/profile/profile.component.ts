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
  formData = new FormData();

  constructor(private profileService: ProfileService, private toastr: ToastsManager) {
  }

  ngOnInit() {
    this.getProfile();
  }

  fileChangeEvent(fileInput: any) {
    this.formData.append('identification_image', fileInput.target.files[0]);
  }

  constructFormData() {
    Object.keys(this.client).forEach(key => {
      if (this.client[key]) {
        this.formData.append(key, this.client[key]);
      }
    });
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
    this.constructFormData();
    this.profileService.updateProfile(this.formData, this.client.id)
      .subscribe(
        client => {
          if (client) {
            this.toastr.success('Profile updated successfully').catch();
          }
        },
        () => {
        },
        () => {
          this.formData = new FormData();
          this.getProfile();
        }
      );
  }

}
