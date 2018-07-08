import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(public auth: AuthService, public router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;

    if (this.auth.adminTokenNotExpired()) {
      return true;
    }

    // store the attempted URL for redirecting
    this.auth.redirectUrl = url;

    this.router.navigate(['/admin-login']);

    return false;
  }
}
