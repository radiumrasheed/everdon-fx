import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {NavigationComponent} from './header-navigation/navigation.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {SpinnerComponent} from './spinner.component';
import {RouterModule} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {ExpressTransactionComponent} from './express-transaction/express-transaction.component';
import {FormsModule} from '@angular/forms';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true,
};


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbModule,
    PerfectScrollbarModule,
  ],
  declarations: [
    BreadcrumbComponent,
    NavigationComponent,
    SidebarComponent,
    SpinnerComponent,
    ExpressTransactionComponent
  ],
  exports: [
    BreadcrumbComponent,
    NavigationComponent,
    SidebarComponent,
    SpinnerComponent,
    ExpressTransactionComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule {
}
