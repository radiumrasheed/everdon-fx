import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../services/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService,
              private router: Router) {

  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // console.log('AuthGuard #CanActivate called');
    const url: string = state.url;

    return this.checkLogin(url);
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }

  checkLogin(url: string): boolean {
    if (this.authService.tokenNotExpired()) {
      return true;
    }

    // store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    this.router.navigate([
      '/login'
    ]);

    return false;
  }
}
