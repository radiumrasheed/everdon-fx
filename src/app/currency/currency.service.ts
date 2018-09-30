import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from '../app.config';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {Observable} from 'rxjs';
import {Product} from '../shared/meta-data';
import {catchError, map} from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})
export class CurrencyService {

	private readonly productUrl = AppConfig.API_URL + '/products';
	private readonly dashboardUrl = AppConfig.API_URL + '/dashboard';
	private readonly handleError: HandleError;


	constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
		this.handleError = httpErrorHandler.createHandleError('Currency Service');
	}


	/** GET: get the list of all videos */
	getProducts(): Observable<Product[]> {
		return this.http.get<any>(this.productUrl)
			.pipe(
				map(response => response['data']['products']),
				catchError(this.handleError<Product[]>('Get all Products', []))
			);
	}


	public updateProduct(product_id: number, product: Product) {
		return this.http.patch(`${this.productUrl}/${product_id}`, product)
			.pipe(
				map(response => response['data']['product']),
				catchError(this.handleError<Product>('Update Product', null))
			);
	}


	public buckets(): Observable<any> {
		return this.http.get<any>(this.dashboardUrl + '/buckets')
			.pipe(
				map(response => response['data']['products'])
				// catchError(this.handleError<any>('Get Bucket Balance', null))
			);
	}
}
