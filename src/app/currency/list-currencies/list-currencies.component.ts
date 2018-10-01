import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';

import { CurrencyService } from '../currency.service';
import { Product } from '../../shared/meta-data';


@Component({
	selector: 'app-list-currencies',
	templateUrl: './list-currencies.component.html',
	styleUrls: ['./list-currencies.component.css'],
	providers: [CurrencyService]
})
export class ListCurrenciesComponent implements OnInit {

	buckets: any;
	dataSet = [];
	editCache = {};
	formatterNaira = value => `₦ ${value}`;
	i = 1;
	loading = false;
	parserNaira = value => value.replace('₦ ', '');
	waccs: any;
	index1: number;


	constructor(private currencyService: CurrencyService, private message: NzMessageService) {
	}


	ngOnInit(): void {
		this.getProducts();
		this.getBucketBalance();
	}


	startEdit(key: string): void {
		this.editCache[key].edit = true;
	}


	getProducts() {
		this.loading = true;
		this.currencyService.getProducts()
			.pipe(finalize(() => {
				this.updateEditCache();
				this.loading = false;
			}))
			.subscribe(
				products => this.dataSet = products
			)
	}


	updateProduct(product: Product) {
		this.loading = true;
		this.currencyService.updateProduct(product.id, product)
			.pipe(finalize(() => this.loading = false))
			.subscribe(updated_product => {
				if (updated_product) {
					this.updateDataSet(updated_product.id, updated_product);
					this.message.success('Updated Successfully', {nzDuration: 10000});
				}
			})
	}


	cancelEdit(key: string): void {
		this.editCache[key].edit = false;
	}


	saveEdit(key: string): void {
		this.updateProduct(this.editCache[key].data);
	}


	updateEditCache(): void {
		this.dataSet.forEach(item => {
			if (!this.editCache[item.id]) {
				this.editCache[item.id] = {
					edit: false,
					data: {...item}
				};
			}
		});
	}


	updateDataSet(key: string, data: any): void {
		const index = this.dataSet.findIndex(item => item.id === key);

		Object.assign(this.dataSet[index], data);
		Object.assign(this.editCache[key], data);

		// this.dataSet[ index ] = this.editCache[ key ].data;
		this.editCache[key].edit = false;
	}


	getBucketBalance() {
		this.currencyService.buckets()
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

}
