import * as $ from 'jquery';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {ErrorHandler, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, RequestOptions} from '@angular/http';
import {RouterModule} from '@angular/router';

import {FullComponent} from './layouts/full/full.component';
import {BlankComponent} from './layouts/blank/blank.component';
import {LoginComponent} from './authentication/login/login.component';
import {Login2Component} from './authentication/login2/login2.component';
import {SignupComponent} from './authentication/signup/signup.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ToastModule, ToastOptions} from 'ng2-toastr';

import {AppRoutes} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthService} from './services/auth/auth.service';
import {AuthErrorHandler} from './services/auth/auth-error.handler';
import {AuthRequestOptions} from './services/auth/auth.request';
import {RequestCache, RequestCacheWithMap} from './services/request-cache.service';
import {HttpErrorHandler} from './services/http-error-handler.service';
import {MessageService} from './services/message.service';
import {HttpInterceptorProviders} from './http-interceptors';
import {AuthGuard} from './guards/auth/auth.guard';
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from './shared/shared.module';
import {AdminGuard} from './guards/admin.guard';
import {NotFoundComponent} from './authentication/404/not-found.component';

export class ToastConfig extends ToastOptions {
  showCloseButton = true;
  animate = 'fade';
  positionClass = 'toast-top-center';
  maxShown = 3;
}

@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    BlankComponent,
    LoginComponent,
    Login2Component,
    SignupComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    SharedModule,
    HttpModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(AppRoutes, {useHash: false}),
    ToastModule.forRoot(),
  ],
  providers: [
    AuthService,
    AuthGuard,
    AdminGuard,
    {
      provide: ToastOptions,
      useClass: ToastConfig
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: RequestOptions,
      useClass: AuthRequestOptions
    },
    {
      provide: ErrorHandler,
      useClass: AuthErrorHandler
    },
    {
      provide: RequestCache,
      useClass: RequestCacheWithMap
    },
    HttpErrorHandler,
    MessageService,
    HttpInterceptorProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
