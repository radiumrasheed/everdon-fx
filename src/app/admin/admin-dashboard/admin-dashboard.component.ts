import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AdminDashboardService} from './admin-dashboard.service';
import {Transaction} from '../../transaction/transaction';

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
    {data: [0, 50, 30, 60, 180, 120, 180, 80], label: 'Sales '},
    {data: [0, 100, 70, 100, 240, 180, 220, 140], label: 'Expense '},
    {data: [0, 150, 110, 240, 200, 200, 300, 200], label: 'Earning '}
  ];
  // This is for the dashboar line chart
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
          beginAtZero: true
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
    maintainAspectRatio: false,


  };
  public lineChartColors: Array<any> = [
    {
      // dark grey
      backgroundColor: 'rgba(234,237,242,1)',
      borderColor: 'rgba(234,237,242,1)',
      pointBackgroundColor: 'rgba(234,237,242,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(234,237,242,1)'
    },
    {
      // grey
      backgroundColor: 'rgba(76,139,236,1)',
      borderColor: 'rgba(76,139,236,1)',
      pointBackgroundColor: 'rgba(76,139,236,1)',
      pointBorderColor: '#fff',

      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(76,139,236,1)'
    }, {
      // grey
      backgroundColor: 'rgba(117,91,241,1)',
      borderColor: 'rgba(117,91,241,1)',
      pointBackgroundColor: 'rgba(117,91,241,1)',
      pointBorderColor: '#fff',

      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(117,91,241,1)'
    }


  ];
  public lineChartLegend = false;
  public lineChartType = 'line';

  // API Stats...
  public figures: any;
  public buckets: any;
  public transactions: Transaction[];


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
        }
      );
  }

}
