import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../services/auth/auth.service';
import {decode} from 'jwt-decode';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(public auth: AuthService, public router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // this will be passed from the route config
    // on the data property
    const expectedRole = next.data.expectedRole;
    const token = localStorage.getItem('token');
    // decode the token to get its payload
    const tokenPayload = decode(token);
    if (
      !this.auth.isLoggedIn ||
      tokenPayload.role !== expectedRole
    ) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
