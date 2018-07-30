import * as $ from 'jquery';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';

import {CloudinaryModule, CloudinaryConfiguration} from '@cloudinary/angular-5.x';
import {Cloudinary} from 'cloudinary-core';
import {ImageViewerModule} from '@hallysonh/ngx-imageviewer';
import {ToastrModule} from 'ngx-toastr';
import {SweetAlert2Module} from '@toverux/ngx-sweetalert2';
import {ImageUploadModule} from 'angular2-image-upload';
import {UiSwitchModule} from 'ngx-ui-switch';

import {FullComponent} from './layouts/full/full.component';
import {BlankComponent} from './layouts/blank/blank.component';
import {LoginComponent} from './authentication/login/login.component';
import {Login2Component} from './authentication/login2/login2.component';
import {SignupComponent} from './authentication/signup/signup.component';

import {AppRoutes} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthService} from './services/auth/auth.service';
import {RequestCache, RequestCacheWithMap} from './services/request-cache.service';
import {HttpErrorHandler} from './services/http-error-handler.service';
import {MessageService} from './services/message.service';
import {HttpInterceptorProviders} from './http-interceptors';
import {AuthGuard} from './guards/auth/auth.guard';
import {SharedModule} from './shared/shared.module';
import {AdminGuard} from './guards/admin.guard';
import {NotFoundComponent} from './authentication/404/not-found.component';
import {AppConfig} from './app.config';

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
		HttpClientModule,
		UiSwitchModule,
		ImageViewerModule,
		NgbModule.forRoot(),
		ImageUploadModule.forRoot(),
		CloudinaryModule.forRoot({Cloudinary}, {cloud_name: AppConfig.CLOUDINARY_CLOUD_NAME} as CloudinaryConfiguration),
		RouterModule.forRoot(AppRoutes, {
			useHash: false
		}),
		ToastrModule.forRoot({
			positionClass: 'toast-top-center'
		}),
		SweetAlert2Module.forRoot({
			buttonsStyling: false,
			customClass: 'modal-content',
			confirmButtonClass: 'btn btn-primary',
			cancelButtonClass: 'btn btn-warning',
			showCloseButton: true
		})
	],
	providers: [
		AuthService,
		AuthGuard,
		AdminGuard,
		{
			provide: LocationStrategy,
			useClass: HashLocationStrategy
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
