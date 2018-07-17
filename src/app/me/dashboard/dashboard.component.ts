import {Component, OnInit, ViewChild} from '@angular/core';
import {SwalComponent, SwalPartialTargets} from '@toverux/ngx-sweetalert2';
import {ToastrService} from 'ngx-toastr';

import {DashboardService} from './dashboard.service';
import {Account, BANKS, COUNTRIES, GenericOption, PRODUCTS, Transaction, TRANSACTION_MODES, TRANSACTION_TYPES} from '../../shared/meta-data';
import {TransactionService} from '../../transaction/transaction.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService, TransactionService]
})
export class DashboardComponent implements OnInit {

  // Dashboard Properties
  public figures: any;

  public transactions: Transaction[];
  submitting = false;
  newAccount = true;
  availableProducts = PRODUCTS;
  accounts: Account[];
  transaction = new Transaction();

  // Bar chart properties...
  public lineChartData: Array<any> = [
    {
      label: 'usd', data: [],
      fill: false,
      pointRadius: 0,
      pointHitRadius: 10
    },
    {
      label: 'gbp', data: [],
      fill: false,
      pointRadius: 0,
      pointHitRadius: 10
    },
    {
      label: 'eur', data: [],
      fill: false,
      pointRadius: 0,
      pointHitRadius: 10
    },
  ];
  @ViewChild(`requestSwal`) private requestSwalComponent: SwalComponent;
  public lineChartOptions: any = {
    scales: {
      xAxes: [{
        type: 'time',
        display: true,
        distribution: 'linear',
        ticks: {source: 'data'}
      }],
      yAxes: [{
        display: true
      }]
    },
    lineTension: 5,
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      mode: 'index'  // or 'x-axis'
    }
  };
  public lineChartColors: Array<any> = [
    {
      // info
      borderColor: 'rgba(57,139,247,1)',
      pointHoverBorderColor: 'rgba(57,139,247,1)'
    },
    {
      // success
      borderColor: 'rgba(6,215,156,1)',
      pointHoverBorderColor: 'rgba(6,215,156,1)'
    },
    {
      // warning
      borderColor: 'rgba(255,178,43,1)',
      pointHoverBorderColor: 'rgba(255,178,43,1)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  constructor(private dashboardService: DashboardService,
              private transactionService: TransactionService) {
  }

  ngOnInit() {
    this.getFigures();
    this.getTimeline();
    this.getRecentTransactions();
    this.getMyAccounts();
  }

  getMyAccounts(): void {
    this.transactionService.getAccounts()
      .subscribe(
        accounts => {
          if (accounts) {
            this.accounts = accounts;
            if (accounts.length > 0) {
              this.newAccount = false;
            }
          }
        }
      );
  }

  // Get Transaction & Account Figures
  public getFigures() {
    this.dashboardService.figures()
      .subscribe(
        figures => {
          this.figures = figures;
        },
        err => {
        },
        () => {
        }
      );
  }

  // Get recent Transactions
  public getRecentTransactions() {
    this.dashboardService.recentTransactions()
      .subscribe(
        transactions => this.transactions = transactions,
        err => {
        },
        () => {
        }
      );
  }

  // Get Timeline data and plot graph
  public getTimeline() {
    this.dashboardService.timeline()
      .subscribe(
        rates => {
          if (rates) {
            this.lineChartData = [
              {
                label: 'USD', data: rates['usd'],
                fill: false,
                pointRadius: 0,
                pointHitRadius: 10
              },
              {
                label: 'EUR', data: rates['eur'],
                fill: false,
                pointRadius: 0,
                pointHitRadius: 10
              },
              {
                label: 'GBP', data: rates['gbp'],
                fill: false,
                pointRadius: 0,
                pointHitRadius: 10
              }
            ];
          }
        }
      );
  }


  public onSubmittedSuccessfully($event: any) {
    this.requestSwalComponent.nativeSwal.close();
  }
}
