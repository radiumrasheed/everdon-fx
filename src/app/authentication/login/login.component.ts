import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import * as $ from 'jquery';

import {AuthService} from '../../services/auth/auth.service';
import {User} from './user';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	providers: [AuthService]
})
export class LoginComponent implements OnInit, AfterViewInit {

	public user: User = new User();
	submitting = false;
	successMessage: string;
	errorMessage: string;
	_success = new Subject<string>();
	_error = new Subject<string>();

	constructor(public router: Router, public authService: AuthService) {
	}

	ngOnInit() {
		this._error.subscribe((message) => this.errorMessage = message);
		this._error.pipe(
			debounceTime(10000)
		).subscribe(() => this.errorMessage = null);

		this._success.subscribe((message) => this.successMessage = message);
		this._success.pipe(
			debounceTime(10000)
		).subscribe(() => this.successMessage = null);
	}

	ngAfterViewInit() {
		$(function () {
			$('.preloader').fadeOut();
		});

		$('#to-recover').on('click', function () {
			$('#loginform').slideUp();
			$('#recoverform').fadeIn();
		});

		$('#to-login').on('click', function () {
			$('#loginform').fadeIn();
			$('#recoverform').slideUp();
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

	recover() {
		this.submitting = true;
		this.authService.recover(this.user)
			.subscribe(
				response => {
					this._success.next(response);
				},
				error => {
					this._error.next(error.message);
					this.submitting = false;
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
