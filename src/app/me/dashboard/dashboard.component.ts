import {Component, OnInit} from '@angular/core';
import {DashboardService} from './dashboard.service';
import {Transaction} from '../../transaction/transaction';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit {
  public figures: any;
  public transactions: Transaction[];


  // This is for the RATE dashboard line chart...
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

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit() {
    this.getFigures();
    this.getTimeline();
    this.getRecentTransactions();
  }

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
