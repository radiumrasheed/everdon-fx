import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AdminDashboardService} from './admin-dashboard.service';
import {Transaction} from '../../transaction/transaction';
import * as _ from 'lodash';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [AdminDashboardService]
})
export class AdminDashboardComponent implements AfterViewInit, OnInit {

  subtitle: string;
  // lineChart
  public lineChartData: Array<any> = [
    {label: 'usd', data: []},
    {label: 'gbp', data: []},
    {label: 'eur', data: []},
  ];

  // This is for the WACC dashboard line chart
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    scales: {
      xAxes: [{
        type: 'time',
        distribution: 'linear',
        ticks: {source: 'data'},
      }]
    },
    lineTension: 5,
    responsive: true,
    maintainAspectRatio: false
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


  // API Stats...
  public figures: any;
  public buckets: any;
  public transactions: Transaction[];
  public waccs: any;


  // Doughnut...
  public doughnutChartLabels: string[] = [
    'Open',
    'In Progress',
    'Awaiting Approval',
    'Awaiting Fulfilment',
    'Closed'
  ];
  public doughnutChartOptions: any = {
    borderWidth: 2,
    maintainAspectRatio: false,
  };
  public doughnutChartData: number[] = [150, 450, 200, 20, 5];
  public doughnutChartType = 'doughnut';
  public doughnutChartLegend = false;


  constructor(private dashboardService: AdminDashboardService) {
    this.subtitle = 'This is some text within a card block.';
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.getBucketBalance();
    this.getTimeline();

    const channel = this.dashboardService.init();
    channel.bind('App\\Events\\NewRates', (rates: any) => {
      this.getTimeline();
    });
  }

  public getFigures() {
    this.dashboardService.figures()
      .subscribe(
        figures => this.figures = figures
      );
  }

  public getRecentTransactions() {
    this.dashboardService.recentTransactions()
      .subscribe(
        transactions => this.transactions = transactions
      );
  }

  public getBucketBalance() {
    this.dashboardService.buckets()
      .subscribe(
        buckets => {
          this.buckets = buckets;

          // !drop ngn...
          this.waccs = _.dropRight(this.buckets);
        }
      );
  }

  public getTimeline() {
    this.dashboardService.timeline()
      .subscribe(
        rates => {
          this.lineChartData = [
            {label: 'USD', data: rates['usd']},
            {label: 'EUR', data: rates['eur']},
            {label: 'GBP', data: rates['gbp']}
          ];
        }
      );
  }

}
