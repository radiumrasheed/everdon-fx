import { Routes } from '@angular/router';

import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth/auth.guard';

import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { LoginComponent } from './authentication/login/login.component';
import { SignupComponent } from './authentication/signup/signup.component';
import { Login2Component } from './authentication/login2/login2.component';
import { NotFoundComponent } from './authentication/404/not-found.component';

export const AppRoutes: Routes = [
	{
		path: '',
		component: FullComponent,
		children: [
			{path: '', redirectTo: '/me/dashboard', pathMatch: 'full'},
			{path: 'me', canActivate: [AuthGuard], loadChildren: './me/me.module#MeModule'},
			{path: 'admin', canActivate: [AdminGuard], loadChildren: './admin/admin.module#AdminModule'}
		]
	},
	{
		path: '',
		component: BlankComponent,
		children: [
			{path: '404', component: NotFoundComponent},
			{path: 'login', component: LoginComponent},
			{path: 'admin-login', component: Login2Component},
			{path: 'signup', redirectTo: '/sign-up', pathMatch: 'full'},
			{path: 'sign-up', component: SignupComponent}
		]
	},
	{
		path: '**',
		redirectTo: '/'
	}
];


