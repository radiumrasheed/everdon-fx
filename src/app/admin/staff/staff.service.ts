import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HandleError, HttpErrorHandler } from '../../services/http-error-handler.service';
import { Product } from '../../shared/meta-data';
import { AppConfig } from '../../app.config';
import { Staff } from './staff.component';


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
		const {pageIndex, pageSize, sortField, sortOrder, ...filters} = options;
		let params = new HttpParams()
			.append('page', `${pageIndex}`)
			.append('per_page', `${pageSize}`)
			.append('sort_field', `${sortField}`)
			.append('sort_order', `${sortOrder}`);

		for (const [key, value] of Object.entries(filters)) {
			params = params.append(key, value.toString());
		}

		return this.http.get<any>(this.staffUrl, {params})
			.pipe(
				map(response => response['data']['staffs']),
				// catchError(this.handleError<any>('Get all Staffs', {}))
			);
	}


	public updateStaff(staff_id: number, staff: Staff) {
		return this.http.patch(`${this.staffUrl}/${staff_id}`, staff)
			.pipe(
				map(response => response['data']['staff']),
				catchError(this.handleError<Staff>('Update Staff', null))
			);
	}


	public addStaff(staff: any): Observable<any> {
		return this.http.post<any>(this.staffUrl, staff)
			.pipe(
				map(response => response['data']['staff']),
				catchError(this.handleError<any>('Add Staff', null))
			);
	}


	public deleteStaff(staff_id: number): Observable<any> {
		return this.http.delete(`${this.staffUrl}/${staff_id}`)
			.pipe(
				catchError(this.handleError<any>('Delete Staff', null))
			)
	}
}
