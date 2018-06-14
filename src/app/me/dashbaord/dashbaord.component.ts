import {Component, OnInit} from '@angular/core';
import {DashboardService} from './dashboard.service';
import {Transaction} from '../../transaction/transaction';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.css'],
  providers: [DashboardService]
})
export class DashbaordComponent implements OnInit {
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
