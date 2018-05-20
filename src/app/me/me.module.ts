import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashbaordComponent} from './dashbaord/dashbaord.component';
import {MeRoutingModule} from './me.routing';

import {ChartistModule} from 'ng-chartist';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {Ng2SmartTableModule} from 'ng2-smart-table';
import {ChartsModule} from 'ng2-charts';
import {FormsModule} from '@angular/forms';
import {ProfileComponent} from './profile/profile.component';
import {MeComponent} from './me.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    NgbModule,
    SharedModule,
    ChartsModule,
    ChartistModule,
    Ng2SmartTableModule,
    MeRoutingModule,
  ],
  declarations: [
    DashbaordComponent,
    ProfileComponent,
    MeComponent,
  ]
})
export class MeModule {
}
