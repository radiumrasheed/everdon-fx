import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {User} from './user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit, AfterViewInit {

  public user: User = new User();
  submitting = false;

  constructor(public router: Router, public authService: AuthService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    $(function () {
      $('.preloader').fadeOut();
    });

    $('#to-recover').on('click', function () {
      $('#loginform').slideUp();
      $('#recoverform').fadeIn();
    });
  }

  login() {
    this.submitting = true;
    this.authService.login(this.user)
      .subscribe(
        () => {
          if (this.authService.tokenNotExpired()) {
            // get the redirect url from our auth service, else use default
            const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : 'me';

            // redirect the user
            this.router.navigate([redirect]).catch();

          }
        },
        () => {
        },
        () => {
          this.submitting = false;
        }
      );
  }

  logout() {
    this.authService.logout();
  }
}
