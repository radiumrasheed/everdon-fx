import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard/dashboard.component';
import {MeRoutingModule} from './me.routing';
import {ImageViewerModule} from '@hallysonh/ngx-imageviewer';

import {ChartistModule} from 'ng-chartist';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ChartsModule} from 'ng2-charts';
import {FormsModule} from '@angular/forms';
import {ProfileComponent} from './profile/profile.component';
import {MeComponent} from './me.component';
import {SharedModule} from '../shared/shared.module';
import {MomentModule} from 'angular2-moment';
import {SweetAlert2Module} from '@toverux/ngx-sweetalert2';
import {ImageUploadModule} from 'angular2-image-upload';
import {CloudinaryModule} from '@cloudinary/angular-5.x';

@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		NgbModule,
		SharedModule,
		ChartsModule,
		ChartistModule,
		MeRoutingModule,
		MomentModule,
		CloudinaryModule,
		SweetAlert2Module,
		ImageUploadModule,
		ImageViewerModule
	],
	declarations: [
		DashboardComponent,
		ProfileComponent,
		MeComponent,
	]
})
export class MeModule {
}
