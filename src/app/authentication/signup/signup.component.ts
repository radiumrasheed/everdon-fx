import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {User} from '../login/user';
import {ToastsManager} from 'ng2-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  user: User = new User();

  constructor(private authService: AuthService,
              private router: Router,
              private toastr: ToastsManager) {
  }

  ngOnInit() {
  }

  signUp() {
    if (this.user.password !== this.user.password_confirmation) {
      return this.toastr.error('Provided Passwords do not match!').catch();
    }

    this.authService.signUp(this.user)
      .subscribe(
        user => {
          if (user) {
            // get the redirect url from our auth service, else use default
            const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : 'me';

            // redirect the user
            this.router.navigate([redirect])
              .then(_ => this.toastr.success('SignUp successful'))
              .catch();
          }
        }
      );
  }
}
