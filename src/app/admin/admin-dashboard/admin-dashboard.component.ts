import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AdminDashboardService} from './admin-dashboard.service';
import {Transaction} from '../../transaction/transaction';
import * as _ from 'lodash';

declare var require: any;

// const data: any = require('../../dashboards/dashboard1/data.json');

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
    {data: [327.2, 346.0, 366.1, 363.5, 362.9, 350.1, 362.8, 360.7], label: 'USD/NGN'},
    {data: [421.5, 441.5, 421.5, 421.5, 461.5, 481.5, 421.5, 415.5], label: 'EUR/NGN '},
    {data: [467.3, 476.2, 490.3, 420.0, 411.0, 420.5, 330.9, 470.2], label: 'GBP/NGN '}
  ];

  // This is for the WACC dashboard line chart
  public lineChartLabels: Array<any> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug'
  ];
  public lineChartOptions: any = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: false
        },
        gridLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }],
      xAxes: [{
        gridLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
      }]
    },
    lineTension: 10,
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
  public lineChartLegend = false;
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
  }

  public getFigures() {
    this.dashboardService.figures()
      .subscribe(
        figures => this.figures = figures,
        err => {
        },
        () => {
        }
      );
  }

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

  public getBucketBalance() {
    this.dashboardService.buckets()
      .subscribe(
        buckets => {
          this.buckets = buckets;
          this.waccs = _.dropRight(this.buckets);
        }
      );
  }

}
