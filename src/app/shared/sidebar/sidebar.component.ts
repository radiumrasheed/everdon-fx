import {Component, AfterViewInit, OnInit, Input} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ROUTES} from './menu-items';
import {RouteInfo} from './sidebar.metadata';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {Observable} from 'rxjs';

declare var $: any;

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html'

})
export class SidebarComponent implements OnInit {

	role$: Observable<string>;
	showMenu: String = '';
	showSubMenu: String = '';
	@Input() public sidebarnavItems: any[];

	constructor(private modalService: NgbModal,
	            private router: Router,
	            private auth: AuthService,
	            private route: ActivatedRoute) {

	}

	// this is for the open close
	addExpandClass(element: any) {
		if (element === this.showMenu) {
			this.showMenu = '0';

		} else {
			this.showMenu = element;
		}
	}

	addActiveClass(element: any) {
		if (element === this.showSubMenu) {
			this.showSubMenu = '0';

		} else {
			this.showSubMenu = element;
		}
	}

	// End open close
	ngOnInit() {
		this.role$ = this.auth.role;

		this.sidebarnavItems = ROUTES.filter(sidebarnavItem => sidebarnavItem);

		$(function () {
			$('.sidebartoggler').on('click', function () {
				if ($('#main-wrapper').hasClass('mini-sidebar')) {
					$('body').trigger('resize');
					$('#main-wrapper').removeClass('mini-sidebar');

				} else {
					$('body').trigger('resize');
					$('#main-wrapper').addClass('mini-sidebar');
				}
			});

		});

	}
}
