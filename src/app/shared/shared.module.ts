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
import {StatusPipe} from './pipes/status.pipe';
import {TypePipe} from './pipes/type.pipe';
import {ModePipe} from './pipes/mode.pipe';
import {ProductPipe} from './pipes/product.pipe';
import {RequestTransactionFormService} from './request-transaction-form/request-transaction-form.service';
import {RequestTransactionFormComponent} from './request-transaction-form/request-transaction-form.component';
import {CreateClientFormComponent} from './create-client-form/create-client-form.component';
import {SweetAlert2Module} from '@toverux/ngx-sweetalert2';
import {LoaderComponent} from './loader/loader.component';

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
    SweetAlert2Module,
  ],
  declarations: [
    BreadcrumbComponent,
    NavigationComponent,
    SidebarComponent,
    SpinnerComponent,
    ExpressTransactionComponent,
    RequestTransactionFormComponent,
    CreateClientFormComponent,
    StatusPipe,
    TypePipe,
    ModePipe,
    ProductPipe,
    LoaderComponent,
  ],
  exports: [
    BreadcrumbComponent,
    NavigationComponent,
    SidebarComponent,
    SpinnerComponent,
    ExpressTransactionComponent,
    RequestTransactionFormComponent,
    CreateClientFormComponent,
    StatusPipe,
    TypePipe,
    ModePipe,
    ProductPipe
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
