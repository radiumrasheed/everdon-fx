import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SwalComponent} from '@toverux/ngx-sweetalert2';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import * as _ from 'lodash';

import {AdminDashboardService} from './admin-dashboard.service';
import {AuthService} from '../../services/auth/auth.service';
import {Event, Transaction} from '../../shared/meta-data';


@Component({
	selector: 'app-admin-dashboard',
	templateUrl: './admin-dashboard.component.html',
	styleUrls: ['./admin-dashboard.component.css'],
	providers: [AdminDashboardService]
})
export class AdminDashboardComponent implements AfterViewInit, OnInit {
	// Child Components...
	@ViewChild(`requestSwal`) private requestSwalComponent: SwalComponent;
	@ViewChild(`createSwal`) private createSwalComponent: SwalComponent;

	// Authentication Properties...
	roles$: Observable<string>;
	role: string;
	transaction = new Transaction();

	// This is for the WACC dashboard line chart...
	lineChartData: Array<any> = [
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
		}
	];
	lineChartOptions: any = {
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
	lineChartColors: Array<any> = [
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
	lineChartLegend = true;
	lineChartType = 'line';

	// API Stats...
	counts: any;
	buckets: any;
	transactions: Transaction[];
	events: Event[];
	waccs: any;

	// Doughnut...
	doughnutChartLabels: string[] = [
		'Open',
		'In Progress',
		'Awaiting Approval',
		'Awaiting Fulfilment',
		'Canceled',
		'Closed'
	];
	doughnutChartData: number[] = [0, 0, 0, 0, 0, 0];
	totalTransactions = 0;
	doughnutChartOptions: any = {
		borderWidth: 2,
		maintainAspectRatio: false,
		total: this.totalTransactions
	};
	doughnutChartType = 'doughnut';
	doughnutChartLegend = false;


	constructor(
		private dashboardService: AdminDashboardService,
		private auth: AuthService,
		private router: Router,
		private route: ActivatedRoute
	) {
	}


	ngAfterViewInit() {
	}


	ngOnInit() {
		this.roles$ = this.auth.roles;
		this.roles$.subscribe(roles => this.role = roles[0]);

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


	getTransactionCounts() {
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


	getRecentTransactions() {
		this.dashboardService.recentTransactions()
			.subscribe(
				transactions => this.transactions = transactions
			);
	}


	getRecentEvents() {
		this.dashboardService.recentEvents()
			.subscribe(
				events => this.events = events
			);
	}


	getBucketBalance() {
		this.dashboardService.buckets()
			.subscribe(
				buckets => {
					this.buckets = buckets;

					// Calculate sum of currencies in local equivalent...
					let sum = 0;
					_.forEach(this.buckets, bucket => {
						sum += parseFloat(bucket.bucket_local);
					});

					_.forEach(this.buckets, bucket => {
						// !Get .percentage
						bucket.percentage = (parseFloat(bucket.bucket_local) / sum) * 100;

						// !Get .ratio
						bucket.ratio = (parseFloat(bucket.bucket_cash) / parseFloat(bucket.bucket) * 100);

						// !Get .direction
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

						// !Get .type
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

						// !Get .ratio_type
						switch (true) {
							case 0 <= bucket.ratio && bucket.ratio < 20:
								bucket.ratio_type = 'danger';
								break;
							case 20 <= bucket.ratio && bucket.ratio <= 40:
								bucket.ratio_type = 'info';
								break;
							case bucket.ratio > 40:
								bucket.ratio_type = 'success';
								break;
							default:
								bucket.ratio_type = '';
						}
					});

					// !Drop local currency...
					this.waccs = _.dropRight(this.buckets);
				}
			);
	}


	getTimeline() {
		this.dashboardService.timeline()
			.subscribe(
				wacc => {
					if (wacc) {
						this.lineChartData = [
							{
								label: 'USD', data: wacc['usd'],
								fill: false,
								pointRadius: 0,
								pointHitRadius: 10
							},
							{
								label: 'EUR', data: wacc['eur'],
								fill: false,
								pointRadius: 0,
								pointHitRadius: 10
							},
							{
								label: 'GBP', data: wacc['gbp'],
								fill: false,
								pointRadius: 0,
								pointHitRadius: 10
							}
						];
					}
				}
			);
	}


	onSubmittedSuccessfully($event: any, type: string) {
		switch (type) {
			case 'create':
				this.createSwalComponent.nativeSwal.close();
				break;

			case 'request':
				this.requestSwalComponent.nativeSwal.close();

				// Navigate to the newly requested transaction...
				this.router.navigate(['/admin', 'dashboard']).catch(err => console.error(err, $event));
				break;

			case 'customer-created':
				this.requestSwalComponent.show().catch();
				break;

			default:
			// Do Nothing...
		}
	}
}
