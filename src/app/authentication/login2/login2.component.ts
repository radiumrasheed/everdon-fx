import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {User} from '../login/user';

@Component({
	selector: 'app-login',
	templateUrl: './login2.component.html',
	styleUrls: ['./login2.component.css']
})
export class Login2Component implements OnInit, AfterViewInit {

	public user: User = new User();

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
		this.authService.adminLogin(this.user)
			.subscribe(() => {
				if (this.authService.tokenNotExpired()) {
					// redirect the staff
					this.router.navigate(['/admin', 'dashboard']).catch();
				}
			});
	}

	logout() {
		this.authService.logout();
	}
}
