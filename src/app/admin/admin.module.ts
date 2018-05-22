import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {RouterModule} from '@angular/router';
import {AdminRoutes, AdminRoutingModule} from './admin.routing';
import {ChartsModule} from 'ng2-charts';
import {ChartistModule} from 'ng-chartist';
import {Ng2SmartTableModule} from 'ng2-smart-table';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AdminComponent} from './admin.component';
import {DashboardModule} from '../dashboards/dashboard.module';
import {SharedModule} from '../shared/shared.module';
import {ClientsComponent} from './clients/clients.component';
import {CreateClientComponent} from './create-client/create-client.component';
import {ViewClientComponent} from './view-client/view-client.component';
import {MomentModule} from 'angular2-moment';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    NgbModule,
    ChartsModule,
    ChartistModule,
    Ng2SmartTableModule,
    DashboardModule,
    SharedModule,
    MomentModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminDashboardComponent,
    AdminComponent,
    ClientsComponent,
    CreateClientComponent,
    ViewClientComponent
  ]
})
export class AdminModule {
}
