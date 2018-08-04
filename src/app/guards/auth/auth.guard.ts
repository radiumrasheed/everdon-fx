import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

	constructor(private authService: AuthService, private router: Router) {

	}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		const url: string = state.url;

		return this.checkLogin(url);
	}

	canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.canActivate(next, state);
	}

	checkLogin(url: string): boolean {

		// store the attempted URL for redirecting
		this.authService.redirectUrl = url;

		if (this.authService.clientTokenNotExpired()) {

			return true;
		} else if (this.authService.adminTokenNotExpired()) {
			this.router.navigate(['/admin']).catch();

			return false;
		}

		this.router.navigate(['/login']).catch();

		return false;
	}
}
