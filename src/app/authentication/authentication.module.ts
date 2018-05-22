import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {NotFoundComponent} from './404/not-found.component';
import {LockComponent} from './lock/lock.component';
import {Signup2Component} from './signup2/signup2.component';

import {AuthenticationRoutes} from './authentication.routing';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthenticationRoutes),
    NgbModule
  ],
  declarations: [
    NotFoundComponent,
    LockComponent,
    Signup2Component
  ]
})

export class AuthenticationModule {
}
