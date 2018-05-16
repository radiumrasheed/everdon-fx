import * as $ from 'jquery';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule, LocationStrategy, HashLocationStrategy} from '@angular/common';
import {ErrorHandler, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http, RequestOptions} from '@angular/http';
import {Routes, RouterModule} from '@angular/router';

import {FullComponent} from './layouts/full/full.component';
import {BlankComponent} from './layouts/blank/blank.component';
import {LoginComponent} from './authentication/login/login.component';
import {SignupComponent} from './authentication/signup/signup.component';

import {NavigationComponent} from './shared/header-navigation/navigation.component';
import {SidebarComponent} from './shared/sidebar/sidebar.component';
import {BreadcrumbComponent} from './shared/breadcrumb/breadcrumb.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {PERFECT_SCROLLBAR_CONFIG} from 'ngx-perfect-scrollbar';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {ToastModule} from 'ng2-toastr';

import {Approutes} from './app-routing.module';
import {AppComponent} from './app.component';
import {SpinnerComponent} from './shared/spinner.component';
import {AuthService} from './services/auth/auth.service';
import {AuthErrorHandler} from './services/auth/auth-error.handler';
import {AuthRequestOptions} from './services/auth/auth.request';
import {RequestCache, RequestCacheWithMap} from './services/request-cache.service';
import {HttpErrorHandler} from './services/http-error-handler.service';
import {MessageService} from './services/message.service';
import {HttpInterceptorProviders} from './http-interceptors';
import {AuthGuard} from './guards/auth/auth.guard';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true,
};

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    FullComponent,
    BlankComponent,
    NavigationComponent,
    LoginComponent,
    SignupComponent,
    BreadcrumbComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(Approutes, {useHash: false}),
    ToastModule.forRoot(),
    PerfectScrollbarModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
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
