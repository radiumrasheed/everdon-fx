import { mergeMap, map, filter } from 'rxjs/operators';
import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';


@Component({
	selector: 'app-breadcrumb',
	templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit {

	@Input() layout;
	pageInfo;


	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private titleService: Title
	) {
		this
			.router.events.pipe(
			filter(event => event instanceof NavigationEnd),
			map(() => this.activatedRoute),
			map(route => {
				while (route.firstChild) {
					route = route.firstChild;
				}
				return route;
			}),
			filter(route => route.outlet === 'primary'),
			mergeMap(route => route.data))
			.subscribe((event) => {
				this.titleService.setTitle(event['title']);
				this.pageInfo = event;
			});
	}


	ngOnInit() {
	}
}
