import {Component, AfterViewInit, OnInit} from '@angular/core';
import {NgbModal, ModalDismissReasons, NgbPanelChangeEvent, NgbCarouselConfig} from '@ng-bootstrap/ng-bootstrap';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {AuthService} from '../../services/auth/auth.service';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-navigation',
  styleUrls: ['./navigation.component.css'],
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements AfterViewInit, OnInit {
  name: string;
  public config: PerfectScrollbarConfigInterface = {};


  isLoggedIn$: Observable<boolean>;
  user$: Observable<any>;
  role$: Observable<string>;

  constructor(private modalService: NgbModal, private authService: AuthService, private router: Router, private route: ActivatedRoute) {

  }

  ngAfterViewInit() {
    const set = function () {
      const width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width;
      const topOffset = 0;
      if (width < 1170) {
        $('#main-wrapper').addClass('mini-sidebar');
      } else {
        $('#main-wrapper').removeClass('mini-sidebar');
      }
    };
    $(window).ready(set);
    $(window).on('resize', set);


    $('.search-box a, .search-box .app-search .srh-btn').on('click', function () {
      $('.app-search').toggle(200);
    });


    $('body').trigger('resize');
  }

  ngOnInit() {
    this.isLoggedIn$ = this.authService.isLoggedIn;
    this.user$ = this.authService.user;
    this.role$ = this.authService.role;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).catch();
  }
}
