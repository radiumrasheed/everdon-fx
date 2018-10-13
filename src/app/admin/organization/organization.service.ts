import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HandleError, HttpErrorHandler } from '../../services/http-error-handler.service';
import { AppConfig } from '../../app.config';
import { Organization } from './organization.component';


@Injectable({
	providedIn: 'root'
})
export class OrganizationService {

	private readonly organizationUrl = AppConfig.API_URL + '/organization';
	private readonly handleError: HandleError;


	constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
		this.handleError = httpErrorHandler.createHandleError('Organization Service');
	}


	/** GET: get the list of all organization */
	getOrganization(options): Observable<any> {
		const { pageIndex, pageSize, sortField, sortOrder, ...filters } = options;
		let params = new HttpParams()
			.append('page', `${pageIndex}`)
			.append('per_page', `${pageSize}`)
			.append('sort_field', `${sortField}`)
			.append('sort_order', `${sortOrder}`);

		for (const [key, value] of Object.entries(filters)) {
			params = params.append(key, value.toString());
		}

		return this.http.get<any>(this.organizationUrl, { params })
			.pipe(
				map(response => response['data']['organization'])
				// catchError(this.handleError<any>('Get all organization', {}))
			);
	}


	public updateOrganization(organization_id: number, organization: Organization) {
		return this.http.patch(`${this.organizationUrl}/${organization_id}`, organization)
			.pipe(
				map(response => response['data']['organization']),
				catchError(this.handleError<Organization>('Update Organization', null))
			);
	}


	public addOrganization(organization: any): Observable<any> {
		return this.http.post<any>(this.organizationUrl, organization)
			.pipe(
				map(response => response['data']['organization']),
				catchError(this.handleError<any>('Add Organization', null))
			);
	}


	public deleteOrganization(organization_id: number): Observable<any> {
		return this.http.delete(`${this.organizationUrl}/${organization_id}`)
			.pipe(
				catchError(this.handleError<any>('Delete Organization', null))
			)
	}
}
