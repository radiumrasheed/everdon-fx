import {Routes} from '@angular/router';

import {AuthGuard} from './guards/auth/auth.guard';

import {FullComponent} from './layouts/full/full.component';
import {BlankComponent} from './layouts/blank/blank.component';
import {LoginComponent} from './authentication/login/login.component';
import {SignupComponent} from './authentication/signup/signup.component';
import {AdminGuard} from './guards/admin.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {path: '', redirectTo: '/me/dashboard', pathMatch: 'full'},
      {path: 'me', canActivate: [AuthGuard], loadChildren: './me/me.module#MeModule'},
      // {path: 'admin', canActivate: [AdminGuard], loadChildren: './admin/admin.module#AdminModule', data: {expectedRole: 'admin'}},
      {path: 'dashboard', loadChildren: './dashboards/dashboard.module#DashboardModule'},
      {path: 'starter', loadChildren: './starter/starter.module#StarterModule'},
      {path: 'component', loadChildren: './component/component.module#ComponentsModule'},
      {path: 'icons', loadChildren: './icons/icons.module#IconsModule'},
      {path: 'forms', loadChildren: './form/forms.module#FormModule'},
      {path: 'tables', loadChildren: './table/tables.module#TablesModule'},
      {path: 'charts', loadChildren: './charts/charts.module#ChartModule'},
      {path: 'widgets', loadChildren: './widgets/widgets.module#WidgetsModule'},
      {path: 'extra-component', loadChildren: './extra-component/extra-component.module#ExtraComponentsModule'},
      {path: 'apps', loadChildren: './apps/apps.module#AppsModule'},
      {path: 'sample-pages', loadChildren: './sample-pages/sample-pages.module#SamplePagesModule'},
    ]
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {path: 'authentication', loadChildren: './authentication/authentication.module#AuthenticationModule'},
      {path: 'login', component: LoginComponent},
      {path: 'signup', component: SignupComponent},
    ]
  },
  {
    path: '**',
    redirectTo: '/authentication/404'
  }
];


