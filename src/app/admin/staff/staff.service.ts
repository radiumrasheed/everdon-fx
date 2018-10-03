import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HandleError, HttpErrorHandler } from '../../services/http-error-handler.service';
import { Product } from '../../shared/meta-data';
import { AppConfig } from '../../app.config';


@Injectable({
	providedIn: 'root'
})
export class StaffService {

	private readonly staffUrl = AppConfig.API_URL + '/staffs';
	private readonly handleError: HandleError;


	constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
		this.handleError = httpErrorHandler.createHandleError('Staff Service');
	}


	/** GET: get the list of all staffs */
	getStaffs(options): Observable<any> {
		const {pageIndex, pageSize, sortField, sortOrder} = options;
		const params = new HttpParams()
			.append('page', `${pageIndex}`)
			.append('per_page', `${pageSize}`)
			.append('sort_field', sortField)
			.append('sort_order', sortOrder);

		return this.http.get<any>(this.staffUrl, {params})
			.pipe(
				map(response => response['data']['staffs']),
				catchError(this.handleError<any>('Get all Staffs', {}))
			);
	}


	public updateStaff(product_id: number, product: Product) {
		return this.http.patch(`${this.staffUrl}/${product_id}`, product)
			.pipe(
				map(response => response['data']['staff']),
				catchError(this.handleError<Product>('Update Staff', null))
			);
	}


	public addStaff(staff: any): Observable<any> {
		return this.http.post<any>(this.staffUrl + '/buckets', staff)
			.pipe(
				map(response => response['data']['staff'])
				// catchError(this.handleError<any>('Get Bucket Balance', null))
			);
	}
}
