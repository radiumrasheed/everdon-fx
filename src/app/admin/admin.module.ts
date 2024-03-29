import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminRoutingModule } from './admin.routing';
import { ChartsModule } from 'ng2-charts';
import { ChartistModule } from 'ng-chartist';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { ClientsComponent } from './clients/clients.component';
import { CreateClientComponent } from './create-client/create-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { MomentModule } from 'angular2-moment';
import { HttpInterceptorProviders } from '../http-interceptors';
import { HttpClientModule } from '@angular/common/http';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { ImageViewerModule } from '@hallysonh/ngx-imageviewer';
import { StaffComponent } from './staff/staff.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { OrganizationComponent } from './organization/organization.component';


@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		NgbModule,
		ChartsModule,
		ChartistModule,
		Ng2SmartTableModule,
		SharedModule,
		MomentModule,
		AdminRoutingModule,
		SweetAlert2Module,
		ImageViewerModule,
		NgZorroAntdModule
	],
	declarations: [
		AdminDashboardComponent,
		AdminComponent,
		ClientsComponent,
		CreateClientComponent,
		ViewClientComponent,
		StaffComponent,
		OrganizationComponent
	],
	providers: [
		HttpInterceptorProviders
	]
})
export class AdminModule {
}
