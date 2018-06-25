import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AdminDashboardService} from './admin-dashboard.service';
import {Event, Transaction} from '../../transaction/transaction';
import * as _ from 'lodash';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [AdminDashboardService]
})
export class AdminDashboardComponent implements AfterViewInit, OnInit {

  // This is for the WACC dashboard line chart...
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


  // API Stats...
  public counts: any;
  public buckets: any;
  public transactions: Transaction[];
  public events: Event[];
  public waccs: any;


  // Doughnut...
  public doughnutChartLabels: string[] = [
    'Open',
    'In Progress',
    'Awaiting Approval',
    'Awaiting Fulfilment',
    'Canceled',
    'Closed'
  ];
  public doughnutChartData: number[] = [0, 0, 0, 0, 0, 0];
  public totalTransactions = 0;

  public doughnutChartOptions: any = {
    borderWidth: 2,
    maintainAspectRatio: false,
    total: this.totalTransactions
  };
  public doughnutChartType = 'doughnut';
  public doughnutChartLegend = false;


  constructor(private dashboardService: AdminDashboardService) {
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.getTimeline();
    this.getBucketBalance();
    this.getTransactionCounts();
    this.getRecentTransactions();
    this.getRecentEvents();

    const channel = this.dashboardService.init();
    channel.bind('App\\Events\\NewRates', (rates: any) => {
      this.getTimeline();
    });
  }

  public getTransactionCounts() {
    this.dashboardService.counts()
      .subscribe(
        counts => {
          this.counts = counts;
          this.doughnutChartData = _.values(counts);
          this.doughnutChartLabels = _.keys(counts);
          this.totalTransactions = _.sum(this.doughnutChartData);
        }
      );
  }

  public getRecentTransactions() {
    this.dashboardService.recentTransactions()
      .subscribe(
        transactions => this.transactions = transactions
      );
  }

  public getRecentEvents() {
    this.dashboardService.recentEvents()
      .subscribe(
        events => this.events = events
      );
  }

  public getBucketBalance() {
    this.dashboardService.buckets()
      .subscribe(
        buckets => {
          this.buckets = buckets;

          let sum = 0;
          _.forEach(this.buckets, bucket => {
            sum += parseFloat(bucket.bucket_local);
          });
          _.forEach(this.buckets, bucket => {
            bucket.percentage = (parseFloat(bucket.bucket_local) / sum) * 100;
            switch (true) {
              case (parseFloat(bucket.prev_bucket) === null):
                bucket.direction = 'middle';
                break;
              case (parseFloat(bucket.prev_bucket) > parseFloat(bucket.bucket)):
                bucket.direction = 'down';
                break;
              case (parseFloat(bucket.prev_bucket) < parseFloat(bucket.bucket)):
                bucket.direction = 'up';
                break;
              case (parseFloat(bucket.prev_bucket) === parseFloat(bucket.bucket)):
                bucket.direction = 'middle';
                break;
              default:
                bucket.direction = 'middle';
            }
            switch (true) {
              case 0 <= bucket.percentage && bucket.percentage < 20:
                bucket.type = 'danger';
                break;
              case 20 <= bucket.percentage && bucket.percentage <= 40:
                bucket.type = 'info';
                break;
              case bucket.percentage > 40:
                bucket.type = 'success';
                break;
              default:
                bucket.type = '';
            }
          });

          // !drop local...
          this.waccs = _.dropRight(this.buckets);
        }
      );
  }

  public getTimeline() {
    this.dashboardService.timeline()
      .subscribe(
        rates => {
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
      );
  }

}
