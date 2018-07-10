import {Component, OnInit, ViewChild} from '@angular/core';
import {ProfileService} from './profile.service';
import {BANKS, Client} from '../../transaction/transaction';
import {ToastrService} from 'ngx-toastr';
import {Account} from '../../transaction/transaction';
import {SwalComponent} from '@toverux/ngx-sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [ProfileService]
})
export class ProfileComponent implements OnInit {
  client: Client;
  newAccount = new Account();
  bankList = BANKS;
  submitting = false;
  is_individual: boolean;

  formData = new FormData();
  @ViewChild(`newAccountSwal`) private swalComponent: SwalComponent;

  constructor(private profileService: ProfileService,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.getProfile();
  }

  fileChangeEvent(fileInput: any, name: string) {
    this.formData.append(name, fileInput.target.files[0]);
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
            this.toastr.success('Profile updated successfully');
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

  createAccount() {
    this.submitting = true;
    this.profileService.createAccount(this.newAccount, this.client.id)
      .subscribe(
        accounts => {
          if (accounts) {
            this.toastr.success('New Account details successfully saved to profile');
            this.swalComponent.nativeSwal.close();
            this.client.accounts = accounts;
            this.newAccount = new Account();
          }
        },
        () => {
        },
        () => {
          this.submitting = false;
        }
      );
  }

}
