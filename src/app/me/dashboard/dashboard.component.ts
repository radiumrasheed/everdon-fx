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

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit() {
    this.getFigures();
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
}
