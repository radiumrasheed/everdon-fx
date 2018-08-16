import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {User} from '../login/user';
import {ToastrService} from 'ngx-toastr';
import {COUNTRIES} from '../../shared/meta-data';


@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
	public user: User = new User();
	public submitting: boolean;
	public countries = COUNTRIES;


	constructor(private authService: AuthService,
							private router: Router,
							private toastr: ToastrService) {
	}


	ngOnInit() {
	}


	signUp() {
		if (this.user.password !== this.user.password_confirmation) {
			return this.toastr.error('Provided Passwords do not match!');
		}

		this.submitting = true;
		this.authService.signUp(this.user)
			.subscribe(
				user => {
					if (user) {
						// get the redirect url from our auth service, else use default
						const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : 'me/profile';

						// redirect the user
						this.router.navigate([redirect]).then(_ => this.toastr.success('SignUp successful')).catch();
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
