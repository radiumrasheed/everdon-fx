import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {RouterModule} from '@angular/router';
import {AdminRoutes} from './admin.routing';
import {ChartsModule} from 'ng2-charts';
import {ChartistModule} from 'ng-chartist';
import {Ng2SmartTableModule} from 'ng2-smart-table';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AdminComponent} from './admin.component';
import {DashboardModule} from '../dashboards/dashboard.module';
import {SharedModule} from '../shared/shared.module';

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
    RouterModule.forChild(AdminRoutes),
  ],
  declarations: [AdminDashboardComponent, AdminComponent]
})
export class AdminModule {
}
