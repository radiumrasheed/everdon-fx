import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../transaction.service';
import {ORGANIZATIONS, PRODUCTS, Transaction} from '../transaction';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit {

  public transaction: Transaction;
  public currencyList = PRODUCTS;
  public organizationList = ORGANIZATIONS;

  id: string;

  public roles$: Observable<any>;
  public role$: Observable<string>;

  public nextActionText: string;
  public nextSubmitText: string;

  public can_treat = false;
  public can_approve = false;
  public can_fulfil = false;
  public can_be_rejected = true;
  public can_be_treated = false;
  public can_be_approved = false;
  public can_be_fulfilled = false;
  public can_be_cancelled = true;
  public can_modify_rate = false;
  public can_take_action = false;
  public is_client: boolean;

  constructor(private transactionService: TransactionService,
              private route: ActivatedRoute,
              private router: Router,
              private auth: AuthService,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.roles$ = this.auth.roles;
    this.role$ = this.auth.role;

    // Get Transaction Id from route...
    this.route.paramMap
      .subscribe(params => {
        this.id = params.get('id');
        this.getTransaction(params.get('id'));
      });


    // Check User Role...
    this.roles$.subscribe(
      roles => {

        switch (roles[0]) {
          case 'fx-ops':
            // this.can_treat = true;
            break;

          case 'fx-ops-lead':
            this.can_treat = true;
            break;

          case 'fx-ops-manager':
            this.can_approve = true;
            break;

          case 'treasury-ops':
            this.can_fulfil = true;
            break;

          default:
            this.is_client = true;
            break;
        }
      }
    );
  }

  computeTLogic() {
    if (!this.transaction) {
      return;
    }

    switch (this.transaction.transaction_status_id) {
      case 1: {
        this.nextActionText = 'Treat/Review Transaction';
        this.nextSubmitText = 'Update & Treat';
        this.can_be_treated = true;
        break;
      }

      case 2: {
        this.nextActionText = 'Treat/Review Transaction';
        this.nextSubmitText = 'Update & Treat';
        this.can_be_treated = true;
        this.can_be_rejected = false;
        break;
      }

      case 3: {
        this.nextActionText = 'Approve Transaction';
        this.nextSubmitText = 'Comment & Approve';
        this.can_be_approved = true;
        break;
      }

      case 4: {
        this.nextActionText = 'Fulfil Transaction';
        this.nextSubmitText = 'Comment & Fulfil';
        this.can_be_fulfilled = true;
        break;
      }

      case 5: {
        this.nextActionText = 'CANCELLED';
        this.nextSubmitText = 'CANCELLED';
        this.can_be_rejected = false;
        this.can_be_cancelled = false;
        break;
      }

      case 6: {
        this.nextActionText = 'CLOSED';
        this.nextSubmitText = 'CLOSED';
        this.can_be_rejected = false;
        this.can_be_cancelled = false;
        break;
      }

      default: {
        break;
      }
    }

    switch (true) {
      // FX-Ops...
      case this.can_treat && this.can_be_treated:
        this.can_take_action = true;
        break;

      // FX-Ops Manager...
      case this.can_approve && this.can_be_approved:
        this.can_take_action = true;

        break;

      // Treasury-Ops
      case this.can_fulfil && this.can_be_fulfilled:
        this.can_take_action = true;

        break;

      // I don't know what to do
      default:
        this.can_take_action = false;
    }
  }

  refreshTransaction() {
    delete this.transaction;
    this.getTransaction(this.id);
  }

  getTransaction(id: string): void {
    this.transactionService.getTransaction(id)
      .subscribe(
        transaction => {
          if (!transaction) {
            this.router.navigate(['../../'], {relativeTo: this.route}).catch();
          }

          // Set all configs according to role and status...
          this.transaction = transaction;
          this.computeTLogic();
        }
      );
  }

  updateCalculatedAmount() {
    this.transaction.calculated_amount = this.transaction.rate * this.transaction.amount;
  }

  takeAction() {
    switch (true) {
      // FX-Ops && OPEN or IN_PROGRESS...
      case this.can_treat && this.can_be_treated:
        this.transactionService.treatTransaction(this.transaction, this.id)
          .subscribe(
            treated_transaction => {
              if (treated_transaction) {
                this.transaction = treated_transaction;
                this.toastr.success('Successfully treated');
                this.router.navigate(['../../'], {relativeTo: this.route}).catch();
              }
            }
          );
        break;

      // FX-Ops Manager && PENDING_APPROVAL...
      case this.can_approve && this.can_be_approved:
        this.transactionService.approveTransaction(this.transaction, this.id)
          .subscribe(
            treated_transaction => {
              if (treated_transaction) {
                this.transaction = treated_transaction;
                this.toastr.success('Successfully approved');
                this.router.navigate(['../../'], {relativeTo: this.route}).catch();
              }
            }
          );
        break;

      // Treasury-Ops && PENDING_FULFILMENT
      case this.can_fulfil && this.can_be_fulfilled:
        this.transactionService.fulfilTransaction(this.transaction, this.id)
          .subscribe(
            treated_transaction => {
              if (treated_transaction) {
                this.transaction = treated_transaction;
                this.toastr.success('Fulfilled Successfully');
                this.router.navigate(['../../'], {relativeTo: this.route}).catch();
              }
            }
          );
        break;

      // I don't know what to do
      default:
        this.toastr.info('Something is not right!');
    }
  }

  rejectTransaction() {
    this.transactionService.rejectTransaction(this.transaction, this.id)
      .subscribe(
        treated_transaction => {
          if (treated_transaction) {
            this.transaction = treated_transaction;
            this.toastr.success('Rejected Successfully');
            this.router.navigate(['../../'], {relativeTo: this.route}).catch();
          }
        },
        err => {
        },
        () => {
        }
      );
  }

  cancelTransaction() {
    this.transactionService.cancelTransaction(this.transaction, this.id)
      .subscribe(
        treated_transaction => {
          if (treated_transaction) {
            this.transaction = treated_transaction;
            this.toastr.success('Cancelled Successfully');
            this.router.navigate(['../../'], {relativeTo: this.route}).catch();
          }
        }
      );
  }

  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('printableArea').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
                  <style type="text/css">
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    /*!
 * Bootstrap v4.0.0-beta.2 (https://getbootstrap.com)
 * Copyright 2011-2017 The Bootstrap Authors
 * Copyright 2011-2017 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
    :root {
        --blue: #02bec9;
        --indigo: #6610f2;
        --purple: #7460ee;
        --pink: #e83e8c;
        --red: #fb3a3a;
        --orange: #fd7e14;
        --yellow: #a0aec4;
        --green: #28a745;
        --teal: #20c997;
        --cyan: #17a2b8;
        --white: #ffffff;
        --gray: #868e96;
        --gray-dark: #343a40;
        --primary: #745af2;
        --secondary: #cccccc;
        --success: #06d79c;
        --info: #398bf7;
        --warning: #ffb22b;
        --danger: #ef5350;
        --light: #e9edf2;
        --dark: #263238;
        --breakpoint-xs: 0;
        --breakpoint-sm: 576px;
        --breakpoint-md: 768px;
        --breakpoint-lg: 992px;
        --breakpoint-xl: 1200px;
        --font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        --font-family-monospace: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }

    @media print {
        *,
        *::before,
        *::after {
            text-shadow: none !important;
            box-shadow: none !important;
        }

        a,
        a:visited {
            text-decoration: underline;
        }

        abbr[title]::after {
            content: " (" attr(title) ")";
        }

        pre {
            white-space: pre-wrap !important;
        }

        pre,
        blockquote {
            border: 1px solid #999;
            page-break-inside: avoid;
        }

        thead {
            display: table-header-group;
        }

        tr,
        img {
            page-break-inside: avoid;
        }

        p,
        h2,
        h3 {
            orphans: 3;
            widows: 3;
        }

        h2,
        h3 {
            page-break-after: avoid;
        }

        .navbar {
            display: none;
        }

        .badge {
            border: 1px solid #000;
        }

        .table {
            border-collapse: collapse !important;
        }

        .table td,
        .table th {
            background-color: #fff !important;
        }

        .table-bordered th,
        .table-bordered td {
            border: 1px solid #ddd !important;
        }
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    html {
        font-family: sans-serif;
        line-height: 1.15;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        -ms-overflow-style: scrollbar;
        -webkit-tap-highlight-color: transparent;
    }

    @-ms-viewport {
        width: device-width;
    }

    article, aside, dialog, figcaption, figure, footer, header, hgroup, main, nav, section {
        display: block;
    }

    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background-color: #ffffff;
    }

    [tabindex="-1"]:focus {
        outline: none !important;
    }

    hr {
        box-sizing: content-box;
        height: 0;
        overflow: visible;
    }

    h1, h2, h3, h4, h5, h6 {
        margin-top: 0;
        margin-bottom: 0.5rem;
    }

    p {
        margin-top: 0;
        margin-bottom: 1rem;
    }

    abbr[title],
    abbr[data-original-title] {
        text-decoration: underline;
        text-decoration: underline dotted;
        cursor: help;
        border-bottom: 0;
    }

    address {
        margin-bottom: 1rem;
        font-style: normal;
        line-height: inherit;
    }

    ol,
    ul,
    dl {
        margin-top: 0;
        margin-bottom: 1rem;
    }

    ol ol,
    ul ul,
    ol ul,
    ul ol {
        margin-bottom: 0;
    }

    dt {
        font-weight: 700;
    }

    dd {
        margin-bottom: .5rem;
        margin-left: 0;
    }

    blockquote {
        margin: 0 0 1rem;
    }

    dfn {
        font-style: italic;
    }

    b,
    strong {
        font-weight: bolder;
    }

    small {
        font-size: 80%;
    }

    sub,
    sup {
        position: relative;
        font-size: 75%;
        line-height: 0;
        vertical-align: baseline;
    }

    sub {
        bottom: -.25em;
    }

    sup {
        top: -.5em;
    }

    a {
        color: #745af2;
        text-decoration: none;
        background-color: transparent;
        -webkit-text-decoration-skip: objects;
    }

    a:hover {
        color: #3813ec;
        text-decoration: underline;
    }

    a:not([href]):not([tabindex]) {
        color: inherit;
        text-decoration: none;
    }

    a:not([href]):not([tabindex]):focus, a:not([href]):not([tabindex]):hover {
        color: inherit;
        text-decoration: none;
    }

    a:not([href]):not([tabindex]):focus {
        outline: 0;
    }

    pre,
    code,
    kbd,
    samp {
        font-family: monospace, monospace;
        font-size: 1em;
    }

    pre {
        margin-top: 0;
        margin-bottom: 1rem;
        overflow: auto;
        -ms-overflow-style: scrollbar;
    }

    figure {
        margin: 0 0 1rem;
    }

    img {
        vertical-align: middle;
        border-style: none;
    }

    svg:not(:root) {
        overflow: hidden;
    }

    a,
    area,
    button,
    [role="button"],
    input:not([type="range"]),
    label,
    select,
    summary,
    textarea {
        -ms-touch-action: manipulation;
        touch-action: manipulation;
    }

    table {
        border-collapse: collapse;
    }

    caption {
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        color: #868e96;
        text-align: left;
        caption-side: bottom;
    }

    th {
        text-align: inherit;
    }

    label {
        display: inline-block;
        margin-bottom: .5rem;
    }

    button {
        border-radius: 0;
    }

    button:focus {
        outline: 1px dotted;
        outline: 5px auto -webkit-focus-ring-color;
    }

    input,
    button,
    select,
    optgroup,
    textarea {
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    button,
    input {
        overflow: visible;
    }

    button,
    select {
        text-transform: none;
    }

    button,
    html [type="button"],
    [type="reset"],
    [type="submit"] {
        -webkit-appearance: button;
    }

    button::-moz-focus-inner,
    [type="button"]::-moz-focus-inner,
    [type="reset"]::-moz-focus-inner,
    [type="submit"]::-moz-focus-inner {
        padding: 0;
        border-style: none;
    }

    input[type="radio"],
    input[type="checkbox"] {
        box-sizing: border-box;
        padding: 0;
    }

    input[type="date"],
    input[type="time"],
    input[type="datetime-local"],
    input[type="month"] {
        -webkit-appearance: listbox;
    }

    textarea {
        overflow: auto;
        resize: vertical;
    }

    fieldset {
        min-width: 0;
        padding: 0;
        margin: 0;
        border: 0;
    }

    legend {
        display: block;
        width: 100%;
        max-width: 100%;
        padding: 0;
        margin-bottom: .5rem;
        font-size: 1.5rem;
        line-height: inherit;
        color: inherit;
        white-space: normal;
    }

    progress {
        vertical-align: baseline;
    }

    [type="number"]::-webkit-inner-spin-button,
    [type="number"]::-webkit-outer-spin-button {
        height: auto;
    }

    [type="search"] {
        outline-offset: -2px;
        -webkit-appearance: none;
    }

    [type="search"]::-webkit-search-cancel-button,
    [type="search"]::-webkit-search-decoration {
        -webkit-appearance: none;
    }

    ::-webkit-file-upload-button {
        font: inherit;
        -webkit-appearance: button;
    }

    output {
        display: inline-block;
    }

    summary {
        display: list-item;
    }

    template {
        display: none;
    }

    [hidden] {
        display: none !important;
    }

    h1, h2, h3, h4, h5, h6,
    .h1, .h2, .h3, .h4, .h5, .h6 {
        margin-bottom: 0.5rem;
        font-family: inherit;
        font-weight: 500;
        line-height: 1.2;
        color: inherit;
    }

    h1, .h1 {
        font-size: 2.5rem;
    }

    h2, .h2 {
        font-size: 2rem;
    }

    h3, .h3 {
        font-size: 1.75rem;
    }

    h4, .h4 {
        font-size: 1.5rem;
    }

    h5, .h5 {
        font-size: 1.25rem;
    }

    h6, .h6 {
        font-size: 1rem;
    }

    .lead {
        font-size: 1.25rem;
        font-weight: 300;
    }

    .display-1 {
        font-size: 6rem;
        font-weight: 300;
        line-height: 1.2;
    }

    .display-2 {
        font-size: 5.5rem;
        font-weight: 300;
        line-height: 1.2;
    }

    .display-3 {
        font-size: 4.5rem;
        font-weight: 300;
        line-height: 1.2;
    }

    .display-4 {
        font-size: 3.5rem;
        font-weight: 300;
        line-height: 1.2;
    }

    hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
        border: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    small,
    .small {
        font-size: 80%;
        font-weight: 400;
    }

    mark,
    .mark {
        padding: 0.2em;
        background-color: #fcf8e3;
    }

    .list-unstyled {
        padding-left: 0;
        list-style: none;
    }

    .list-inline {
        padding-left: 0;
        list-style: none;
    }

    .list-inline-item {
        display: inline-block;
    }

    .list-inline-item:not(:last-child) {
        margin-right: 5px;
    }

    .initialism {
        font-size: 90%;
        text-transform: uppercase;
    }

    .blockquote {
        margin-bottom: 1rem;
        font-size: 1.25rem;
    }

    .blockquote-footer {
        display: block;
        font-size: 80%;
        color: #868e96;
    }

    .blockquote-footer::before {
        content: "\\2014   \\A0";
    }

    .img-fluid {
        max-width: 100%;
        height: auto;
    }

    .img-thumbnail {
        padding: 0.25rem;
        background-color: #ffffff;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
        max-width: 100%;
        height: auto;
    }

    .figure {
        display: inline-block;
    }

    .figure-img {
        margin-bottom: 0.5rem;
        line-height: 1;
    }

    .figure-caption {
        font-size: 90%;
        color: #868e96;
    }

    code,
    kbd,
    pre,
    samp {
        font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }

    code {
        padding: 0.2rem 0.4rem;
        font-size: 90%;
        color: #bd4147;
        background-color: #f8f9fa;
        border-radius: 0.25rem;
    }

    a > code {
        padding: 0;
        color: inherit;
        background-color: inherit;
    }

    kbd {
        padding: 0.2rem 0.4rem;
        font-size: 90%;
        color: #ffffff;
        background-color: #212529;
        border-radius: 0.2rem;
    }

    kbd kbd {
        padding: 0;
        font-size: 100%;
        font-weight: 700;
    }

    pre {
        display: block;
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 90%;
        color: #212529;
    }

    pre code {
        padding: 0;
        font-size: inherit;
        color: inherit;
        background-color: transparent;
        border-radius: 0;
    }

    .pre-scrollable {
        max-height: 340px;
        overflow-y: scroll;
    }

    .container {
        width: 100%;
        padding-right: 15px;
        padding-left: 15px;
        margin-right: auto;
        margin-left: auto;
    }

    @media (min-width: 576px) {
        .container {
            max-width: 540px;
        }
    }

    @media (min-width: 768px) {
        .container {
            max-width: 720px;
        }
    }

    @media (min-width: 992px) {
        .container {
            max-width: 960px;
        }
    }

    @media (min-width: 1200px) {
        .container {
            max-width: 1140px;
        }
    }

    .container-fluid {
        width: 100%;
        padding-right: 15px;
        padding-left: 15px;
        margin-right: auto;
        margin-left: auto;
    }

    .row {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        margin-right: -15px;
        margin-left: -15px;
    }

    .no-gutters {
        margin-right: 0;
        margin-left: 0;
    }

    .no-gutters > .col,
    .no-gutters > [class*="col-"] {
        padding-right: 0;
        padding-left: 0;
    }

    .col-1, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-10, .col-11, .col-12, .col,
    .col-auto, .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm,
    .col-sm-auto, .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12, .col-md,
    .col-md-auto, .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg,
    .col-lg-auto, .col-xl-1, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl,
    .col-xl-auto {
        position: relative;
        width: 100%;
        min-height: 1px;
        padding-right: 15px;
        padding-left: 15px;
    }

    .col {
        -ms-flex-preferred-size: 0;
        flex-basis: 0;
        -webkit-box-flex: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        max-width: 100%;
    }

    .col-auto {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 auto;
        flex: 0 0 auto;
        width: auto;
        max-width: none;
    }

    .col-1 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 8.33333333%;
        flex: 0 0 8.33333333%;
        max-width: 8.33333333%;
    }

    .col-2 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 16.66666667%;
        flex: 0 0 16.66666667%;
        max-width: 16.66666667%;
    }

    .col-3 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 25%;
        flex: 0 0 25%;
        max-width: 25%;
    }

    .col-4 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 33.33333333%;
        flex: 0 0 33.33333333%;
        max-width: 33.33333333%;
    }

    .col-5 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 41.66666667%;
        flex: 0 0 41.66666667%;
        max-width: 41.66666667%;
    }

    .col-6 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 50%;
        flex: 0 0 50%;
        max-width: 50%;
    }

    .col-7 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 58.33333333%;
        flex: 0 0 58.33333333%;
        max-width: 58.33333333%;
    }

    .col-8 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 66.66666667%;
        flex: 0 0 66.66666667%;
        max-width: 66.66666667%;
    }

    .col-9 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 75%;
        flex: 0 0 75%;
        max-width: 75%;
    }

    .col-10 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 83.33333333%;
        flex: 0 0 83.33333333%;
        max-width: 83.33333333%;
    }

    .col-11 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 91.66666667%;
        flex: 0 0 91.66666667%;
        max-width: 91.66666667%;
    }

    .col-12 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 100%;
        flex: 0 0 100%;
        max-width: 100%;
    }

    .order-first {
        -webkit-box-ordinal-group: 0;
        -ms-flex-order: -1;
        order: -1;
    }

    .order-1 {
        -webkit-box-ordinal-group: 2;
        -ms-flex-order: 1;
        order: 1;
    }

    .order-2 {
        -webkit-box-ordinal-group: 3;
        -ms-flex-order: 2;
        order: 2;
    }

    .order-3 {
        -webkit-box-ordinal-group: 4;
        -ms-flex-order: 3;
        order: 3;
    }

    .order-4 {
        -webkit-box-ordinal-group: 5;
        -ms-flex-order: 4;
        order: 4;
    }

    .order-5 {
        -webkit-box-ordinal-group: 6;
        -ms-flex-order: 5;
        order: 5;
    }

    .order-6 {
        -webkit-box-ordinal-group: 7;
        -ms-flex-order: 6;
        order: 6;
    }

    .order-7 {
        -webkit-box-ordinal-group: 8;
        -ms-flex-order: 7;
        order: 7;
    }

    .order-8 {
        -webkit-box-ordinal-group: 9;
        -ms-flex-order: 8;
        order: 8;
    }

    .order-9 {
        -webkit-box-ordinal-group: 10;
        -ms-flex-order: 9;
        order: 9;
    }

    .order-10 {
        -webkit-box-ordinal-group: 11;
        -ms-flex-order: 10;
        order: 10;
    }

    .order-11 {
        -webkit-box-ordinal-group: 12;
        -ms-flex-order: 11;
        order: 11;
    }

    .order-12 {
        -webkit-box-ordinal-group: 13;
        -ms-flex-order: 12;
        order: 12;
    }

    .offset-1 {
        margin-left: 8.33333333%;
    }

    .offset-2 {
        margin-left: 16.66666667%;
    }

    .offset-3 {
        margin-left: 25%;
    }

    .offset-4 {
        margin-left: 33.33333333%;
    }

    .offset-5 {
        margin-left: 41.66666667%;
    }

    .offset-6 {
        margin-left: 50%;
    }

    .offset-7 {
        margin-left: 58.33333333%;
    }

    .offset-8 {
        margin-left: 66.66666667%;
    }

    .offset-9 {
        margin-left: 75%;
    }

    .offset-10 {
        margin-left: 83.33333333%;
    }

    .offset-11 {
        margin-left: 91.66666667%;
    }

    @media (min-width: 576px) {
        .col-sm {
            -ms-flex-preferred-size: 0;
            flex-basis: 0;
            -webkit-box-flex: 1;
            -ms-flex-positive: 1;
            flex-grow: 1;
            max-width: 100%;
        }

        .col-sm-auto {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            width: auto;
            max-width: none;
        }

        .col-sm-1 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 8.33333333%;
            flex: 0 0 8.33333333%;
            max-width: 8.33333333%;
        }

        .col-sm-2 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 16.66666667%;
            flex: 0 0 16.66666667%;
            max-width: 16.66666667%;
        }

        .col-sm-3 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 25%;
            flex: 0 0 25%;
            max-width: 25%;
        }

        .col-sm-4 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 33.33333333%;
            flex: 0 0 33.33333333%;
            max-width: 33.33333333%;
        }

        .col-sm-5 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 41.66666667%;
            flex: 0 0 41.66666667%;
            max-width: 41.66666667%;
        }

        .col-sm-6 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 50%;
            flex: 0 0 50%;
            max-width: 50%;
        }

        .col-sm-7 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 58.33333333%;
            flex: 0 0 58.33333333%;
            max-width: 58.33333333%;
        }

        .col-sm-8 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 66.66666667%;
            flex: 0 0 66.66666667%;
            max-width: 66.66666667%;
        }

        .col-sm-9 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 75%;
            flex: 0 0 75%;
            max-width: 75%;
        }

        .col-sm-10 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 83.33333333%;
            flex: 0 0 83.33333333%;
            max-width: 83.33333333%;
        }

        .col-sm-11 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 91.66666667%;
            flex: 0 0 91.66666667%;
            max-width: 91.66666667%;
        }

        .col-sm-12 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 100%;
            flex: 0 0 100%;
            max-width: 100%;
        }

        .order-sm-first {
            -webkit-box-ordinal-group: 0;
            -ms-flex-order: -1;
            order: -1;
        }

        .order-sm-1 {
            -webkit-box-ordinal-group: 2;
            -ms-flex-order: 1;
            order: 1;
        }

        .order-sm-2 {
            -webkit-box-ordinal-group: 3;
            -ms-flex-order: 2;
            order: 2;
        }

        .order-sm-3 {
            -webkit-box-ordinal-group: 4;
            -ms-flex-order: 3;
            order: 3;
        }

        .order-sm-4 {
            -webkit-box-ordinal-group: 5;
            -ms-flex-order: 4;
            order: 4;
        }

        .order-sm-5 {
            -webkit-box-ordinal-group: 6;
            -ms-flex-order: 5;
            order: 5;
        }

        .order-sm-6 {
            -webkit-box-ordinal-group: 7;
            -ms-flex-order: 6;
            order: 6;
        }

        .order-sm-7 {
            -webkit-box-ordinal-group: 8;
            -ms-flex-order: 7;
            order: 7;
        }

        .order-sm-8 {
            -webkit-box-ordinal-group: 9;
            -ms-flex-order: 8;
            order: 8;
        }

        .order-sm-9 {
            -webkit-box-ordinal-group: 10;
            -ms-flex-order: 9;
            order: 9;
        }

        .order-sm-10 {
            -webkit-box-ordinal-group: 11;
            -ms-flex-order: 10;
            order: 10;
        }

        .order-sm-11 {
            -webkit-box-ordinal-group: 12;
            -ms-flex-order: 11;
            order: 11;
        }

        .order-sm-12 {
            -webkit-box-ordinal-group: 13;
            -ms-flex-order: 12;
            order: 12;
        }

        .offset-sm-0 {
            margin-left: 0;
        }

        .offset-sm-1 {
            margin-left: 8.33333333%;
        }

        .offset-sm-2 {
            margin-left: 16.66666667%;
        }

        .offset-sm-3 {
            margin-left: 25%;
        }

        .offset-sm-4 {
            margin-left: 33.33333333%;
        }

        .offset-sm-5 {
            margin-left: 41.66666667%;
        }

        .offset-sm-6 {
            margin-left: 50%;
        }

        .offset-sm-7 {
            margin-left: 58.33333333%;
        }

        .offset-sm-8 {
            margin-left: 66.66666667%;
        }

        .offset-sm-9 {
            margin-left: 75%;
        }

        .offset-sm-10 {
            margin-left: 83.33333333%;
        }

        .offset-sm-11 {
            margin-left: 91.66666667%;
        }
    }

    @media (min-width: 768px) {
        .col-md {
            -ms-flex-preferred-size: 0;
            flex-basis: 0;
            -webkit-box-flex: 1;
            -ms-flex-positive: 1;
            flex-grow: 1;
            max-width: 100%;
        }

        .col-md-auto {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            width: auto;
            max-width: none;
        }

        .col-md-1 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 8.33333333%;
            flex: 0 0 8.33333333%;
            max-width: 8.33333333%;
        }

        .col-md-2 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 16.66666667%;
            flex: 0 0 16.66666667%;
            max-width: 16.66666667%;
        }

        .col-md-3 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 25%;
            flex: 0 0 25%;
            max-width: 25%;
        }

        .col-md-4 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 33.33333333%;
            flex: 0 0 33.33333333%;
            max-width: 33.33333333%;
        }

        .col-md-5 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 41.66666667%;
            flex: 0 0 41.66666667%;
            max-width: 41.66666667%;
        }

        .col-md-6 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 50%;
            flex: 0 0 50%;
            max-width: 50%;
        }

        .col-md-7 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 58.33333333%;
            flex: 0 0 58.33333333%;
            max-width: 58.33333333%;
        }

        .col-md-8 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 66.66666667%;
            flex: 0 0 66.66666667%;
            max-width: 66.66666667%;
        }

        .col-md-9 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 75%;
            flex: 0 0 75%;
            max-width: 75%;
        }

        .col-md-10 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 83.33333333%;
            flex: 0 0 83.33333333%;
            max-width: 83.33333333%;
        }

        .col-md-11 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 91.66666667%;
            flex: 0 0 91.66666667%;
            max-width: 91.66666667%;
        }

        .col-md-12 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 100%;
            flex: 0 0 100%;
            max-width: 100%;
        }

        .order-md-first {
            -webkit-box-ordinal-group: 0;
            -ms-flex-order: -1;
            order: -1;
        }

        .order-md-1 {
            -webkit-box-ordinal-group: 2;
            -ms-flex-order: 1;
            order: 1;
        }

        .order-md-2 {
            -webkit-box-ordinal-group: 3;
            -ms-flex-order: 2;
            order: 2;
        }

        .order-md-3 {
            -webkit-box-ordinal-group: 4;
            -ms-flex-order: 3;
            order: 3;
        }

        .order-md-4 {
            -webkit-box-ordinal-group: 5;
            -ms-flex-order: 4;
            order: 4;
        }

        .order-md-5 {
            -webkit-box-ordinal-group: 6;
            -ms-flex-order: 5;
            order: 5;
        }

        .order-md-6 {
            -webkit-box-ordinal-group: 7;
            -ms-flex-order: 6;
            order: 6;
        }

        .order-md-7 {
            -webkit-box-ordinal-group: 8;
            -ms-flex-order: 7;
            order: 7;
        }

        .order-md-8 {
            -webkit-box-ordinal-group: 9;
            -ms-flex-order: 8;
            order: 8;
        }

        .order-md-9 {
            -webkit-box-ordinal-group: 10;
            -ms-flex-order: 9;
            order: 9;
        }

        .order-md-10 {
            -webkit-box-ordinal-group: 11;
            -ms-flex-order: 10;
            order: 10;
        }

        .order-md-11 {
            -webkit-box-ordinal-group: 12;
            -ms-flex-order: 11;
            order: 11;
        }

        .order-md-12 {
            -webkit-box-ordinal-group: 13;
            -ms-flex-order: 12;
            order: 12;
        }

        .offset-md-0 {
            margin-left: 0;
        }

        .offset-md-1 {
            margin-left: 8.33333333%;
        }

        .offset-md-2 {
            margin-left: 16.66666667%;
        }

        .offset-md-3 {
            margin-left: 25%;
        }

        .offset-md-4 {
            margin-left: 33.33333333%;
        }

        .offset-md-5 {
            margin-left: 41.66666667%;
        }

        .offset-md-6 {
            margin-left: 50%;
        }

        .offset-md-7 {
            margin-left: 58.33333333%;
        }

        .offset-md-8 {
            margin-left: 66.66666667%;
        }

        .offset-md-9 {
            margin-left: 75%;
        }

        .offset-md-10 {
            margin-left: 83.33333333%;
        }

        .offset-md-11 {
            margin-left: 91.66666667%;
        }
    }

    @media (min-width: 992px) {
        .col-lg {
            -ms-flex-preferred-size: 0;
            flex-basis: 0;
            -webkit-box-flex: 1;
            -ms-flex-positive: 1;
            flex-grow: 1;
            max-width: 100%;
        }

        .col-lg-auto {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            width: auto;
            max-width: none;
        }

        .col-lg-1 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 8.33333333%;
            flex: 0 0 8.33333333%;
            max-width: 8.33333333%;
        }

        .col-lg-2 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 16.66666667%;
            flex: 0 0 16.66666667%;
            max-width: 16.66666667%;
        }

        .col-lg-3 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 25%;
            flex: 0 0 25%;
            max-width: 25%;
        }

        .col-lg-4 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 33.33333333%;
            flex: 0 0 33.33333333%;
            max-width: 33.33333333%;
        }

        .col-lg-5 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 41.66666667%;
            flex: 0 0 41.66666667%;
            max-width: 41.66666667%;
        }

        .col-lg-6 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 50%;
            flex: 0 0 50%;
            max-width: 50%;
        }

        .col-lg-7 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 58.33333333%;
            flex: 0 0 58.33333333%;
            max-width: 58.33333333%;
        }

        .col-lg-8 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 66.66666667%;
            flex: 0 0 66.66666667%;
            max-width: 66.66666667%;
        }

        .col-lg-9 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 75%;
            flex: 0 0 75%;
            max-width: 75%;
        }

        .col-lg-10 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 83.33333333%;
            flex: 0 0 83.33333333%;
            max-width: 83.33333333%;
        }

        .col-lg-11 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 91.66666667%;
            flex: 0 0 91.66666667%;
            max-width: 91.66666667%;
        }

        .col-lg-12 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 100%;
            flex: 0 0 100%;
            max-width: 100%;
        }

        .order-lg-first {
            -webkit-box-ordinal-group: 0;
            -ms-flex-order: -1;
            order: -1;
        }

        .order-lg-1 {
            -webkit-box-ordinal-group: 2;
            -ms-flex-order: 1;
            order: 1;
        }

        .order-lg-2 {
            -webkit-box-ordinal-group: 3;
            -ms-flex-order: 2;
            order: 2;
        }

        .order-lg-3 {
            -webkit-box-ordinal-group: 4;
            -ms-flex-order: 3;
            order: 3;
        }

        .order-lg-4 {
            -webkit-box-ordinal-group: 5;
            -ms-flex-order: 4;
            order: 4;
        }

        .order-lg-5 {
            -webkit-box-ordinal-group: 6;
            -ms-flex-order: 5;
            order: 5;
        }

        .order-lg-6 {
            -webkit-box-ordinal-group: 7;
            -ms-flex-order: 6;
            order: 6;
        }

        .order-lg-7 {
            -webkit-box-ordinal-group: 8;
            -ms-flex-order: 7;
            order: 7;
        }

        .order-lg-8 {
            -webkit-box-ordinal-group: 9;
            -ms-flex-order: 8;
            order: 8;
        }

        .order-lg-9 {
            -webkit-box-ordinal-group: 10;
            -ms-flex-order: 9;
            order: 9;
        }

        .order-lg-10 {
            -webkit-box-ordinal-group: 11;
            -ms-flex-order: 10;
            order: 10;
        }

        .order-lg-11 {
            -webkit-box-ordinal-group: 12;
            -ms-flex-order: 11;
            order: 11;
        }

        .order-lg-12 {
            -webkit-box-ordinal-group: 13;
            -ms-flex-order: 12;
            order: 12;
        }

        .offset-lg-0 {
            margin-left: 0;
        }

        .offset-lg-1 {
            margin-left: 8.33333333%;
        }

        .offset-lg-2 {
            margin-left: 16.66666667%;
        }

        .offset-lg-3 {
            margin-left: 25%;
        }

        .offset-lg-4 {
            margin-left: 33.33333333%;
        }

        .offset-lg-5 {
            margin-left: 41.66666667%;
        }

        .offset-lg-6 {
            margin-left: 50%;
        }

        .offset-lg-7 {
            margin-left: 58.33333333%;
        }

        .offset-lg-8 {
            margin-left: 66.66666667%;
        }

        .offset-lg-9 {
            margin-left: 75%;
        }

        .offset-lg-10 {
            margin-left: 83.33333333%;
        }

        .offset-lg-11 {
            margin-left: 91.66666667%;
        }
    }

    @media (min-width: 1200px) {
        .col-xl {
            -ms-flex-preferred-size: 0;
            flex-basis: 0;
            -webkit-box-flex: 1;
            -ms-flex-positive: 1;
            flex-grow: 1;
            max-width: 100%;
        }

        .col-xl-auto {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            width: auto;
            max-width: none;
        }

        .col-xl-1 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 8.33333333%;
            flex: 0 0 8.33333333%;
            max-width: 8.33333333%;
        }

        .col-xl-2 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 16.66666667%;
            flex: 0 0 16.66666667%;
            max-width: 16.66666667%;
        }

        .col-xl-3 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 25%;
            flex: 0 0 25%;
            max-width: 25%;
        }

        .col-xl-4 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 33.33333333%;
            flex: 0 0 33.33333333%;
            max-width: 33.33333333%;
        }

        .col-xl-5 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 41.66666667%;
            flex: 0 0 41.66666667%;
            max-width: 41.66666667%;
        }

        .col-xl-6 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 50%;
            flex: 0 0 50%;
            max-width: 50%;
        }

        .col-xl-7 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 58.33333333%;
            flex: 0 0 58.33333333%;
            max-width: 58.33333333%;
        }

        .col-xl-8 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 66.66666667%;
            flex: 0 0 66.66666667%;
            max-width: 66.66666667%;
        }

        .col-xl-9 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 75%;
            flex: 0 0 75%;
            max-width: 75%;
        }

        .col-xl-10 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 83.33333333%;
            flex: 0 0 83.33333333%;
            max-width: 83.33333333%;
        }

        .col-xl-11 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 91.66666667%;
            flex: 0 0 91.66666667%;
            max-width: 91.66666667%;
        }

        .col-xl-12 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 100%;
            flex: 0 0 100%;
            max-width: 100%;
        }

        .order-xl-first {
            -webkit-box-ordinal-group: 0;
            -ms-flex-order: -1;
            order: -1;
        }

        .order-xl-1 {
            -webkit-box-ordinal-group: 2;
            -ms-flex-order: 1;
            order: 1;
        }

        .order-xl-2 {
            -webkit-box-ordinal-group: 3;
            -ms-flex-order: 2;
            order: 2;
        }

        .order-xl-3 {
            -webkit-box-ordinal-group: 4;
            -ms-flex-order: 3;
            order: 3;
        }

        .order-xl-4 {
            -webkit-box-ordinal-group: 5;
            -ms-flex-order: 4;
            order: 4;
        }

        .order-xl-5 {
            -webkit-box-ordinal-group: 6;
            -ms-flex-order: 5;
            order: 5;
        }

        .order-xl-6 {
            -webkit-box-ordinal-group: 7;
            -ms-flex-order: 6;
            order: 6;
        }

        .order-xl-7 {
            -webkit-box-ordinal-group: 8;
            -ms-flex-order: 7;
            order: 7;
        }

        .order-xl-8 {
            -webkit-box-ordinal-group: 9;
            -ms-flex-order: 8;
            order: 8;
        }

        .order-xl-9 {
            -webkit-box-ordinal-group: 10;
            -ms-flex-order: 9;
            order: 9;
        }

        .order-xl-10 {
            -webkit-box-ordinal-group: 11;
            -ms-flex-order: 10;
            order: 10;
        }

        .order-xl-11 {
            -webkit-box-ordinal-group: 12;
            -ms-flex-order: 11;
            order: 11;
        }

        .order-xl-12 {
            -webkit-box-ordinal-group: 13;
            -ms-flex-order: 12;
            order: 12;
        }

        .offset-xl-0 {
            margin-left: 0;
        }

        .offset-xl-1 {
            margin-left: 8.33333333%;
        }

        .offset-xl-2 {
            margin-left: 16.66666667%;
        }

        .offset-xl-3 {
            margin-left: 25%;
        }

        .offset-xl-4 {
            margin-left: 33.33333333%;
        }

        .offset-xl-5 {
            margin-left: 41.66666667%;
        }

        .offset-xl-6 {
            margin-left: 50%;
        }

        .offset-xl-7 {
            margin-left: 58.33333333%;
        }

        .offset-xl-8 {
            margin-left: 66.66666667%;
        }

        .offset-xl-9 {
            margin-left: 75%;
        }

        .offset-xl-10 {
            margin-left: 83.33333333%;
        }

        .offset-xl-11 {
            margin-left: 91.66666667%;
        }
    }

    .table {
        width: 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        background-color: transparent;
    }

    .table th,
    .table td {
        padding: 0.75rem;
        vertical-align: top;
        border-top: 1px solid #e9ecef;
    }

    .table thead th {
        vertical-align: bottom;
        border-bottom: 2px solid #e9ecef;
    }

    .table tbody + tbody {
        border-top: 2px solid #e9ecef;
    }

    .table .table {
        background-color: #ffffff;
    }

    .table-sm th,
    .table-sm td {
        padding: 0.3rem;
    }

    .table-bordered {
        border: 1px solid #e9ecef;
    }

    .table-bordered th,
    .table-bordered td {
        border: 1px solid #e9ecef;
    }

    .table-bordered thead th,
    .table-bordered thead td {
        border-bottom-width: 2px;
    }

    .table-striped tbody tr:nth-of-type(odd) {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .table-hover tbody tr:hover {
        background-color: rgba(0, 0, 0, 0.075);
    }

    .table-primary,
    .table-primary > th,
    .table-primary > td {
        background-color: #d8d1fb;
    }

    .table-hover .table-primary:hover {
        background-color: #c4baf9;
    }

    .table-hover .table-primary:hover > td,
    .table-hover .table-primary:hover > th {
        background-color: #c4baf9;
    }

    .table-secondary,
    .table-secondary > th,
    .table-secondary > td {
        background-color: #f1f1f1;
    }

    .table-hover .table-secondary:hover {
        background-color: #e4e4e4;
    }

    .table-hover .table-secondary:hover > td,
    .table-hover .table-secondary:hover > th {
        background-color: #e4e4e4;
    }

    .table-success,
    .table-success > th,
    .table-success > td {
        background-color: #b9f4e3;
    }

    .table-hover .table-success:hover {
        background-color: #a3f1da;
    }

    .table-hover .table-success:hover > td,
    .table-hover .table-success:hover > th {
        background-color: #a3f1da;
    }

    .table-info,
    .table-info > th,
    .table-info > td {
        background-color: #c8dffd;
    }

    .table-hover .table-info:hover {
        background-color: #afd1fc;
    }

    .table-hover .table-info:hover > td,
    .table-hover .table-info:hover > th {
        background-color: #afd1fc;
    }

    .table-warning,
    .table-warning > th,
    .table-warning > td {
        background-color: #ffe9c4;
    }

    .table-hover .table-warning:hover {
        background-color: #ffdfab;
    }

    .table-hover .table-warning:hover > td,
    .table-hover .table-warning:hover > th {
        background-color: #ffdfab;
    }

    .table-danger,
    .table-danger > th,
    .table-danger > td {
        background-color: #fbcfce;
    }

    .table-hover .table-danger:hover {
        background-color: #f9b8b6;
    }

    .table-hover .table-danger:hover > td,
    .table-hover .table-danger:hover > th {
        background-color: #f9b8b6;
    }

    .table-light,
    .table-light > th,
    .table-light > td {
        background-color: #f9fafb;
    }

    .table-hover .table-light:hover {
        background-color: #eaedf1;
    }

    .table-hover .table-light:hover > td,
    .table-hover .table-light:hover > th {
        background-color: #eaedf1;
    }

    .table-dark,
    .table-dark > th,
    .table-dark > td {
        background-color: #c2c6c7;
    }

    .table-hover .table-dark:hover {
        background-color: #b5babb;
    }

    .table-hover .table-dark:hover > td,
    .table-hover .table-dark:hover > th {
        background-color: #b5babb;
    }

    .table-active,
    .table-active > th,
    .table-active > td {
        background-color: rgba(0, 0, 0, 0.075);
    }

    .table-hover .table-active:hover {
        background-color: rgba(0, 0, 0, 0.075);
    }

    .table-hover .table-active:hover > td,
    .table-hover .table-active:hover > th {
        background-color: rgba(0, 0, 0, 0.075);
    }

    .table .thead-dark th {
        color: #ffffff;
        background-color: #212529;
        border-color: #32383e;
    }

    .table .thead-light th {
        color: #495057;
        background-color: #e9ecef;
        border-color: #e9ecef;
    }

    .table-dark {
        color: #ffffff;
        background-color: #212529;
    }

    .table-dark th,
    .table-dark td,
    .table-dark thead th {
        border-color: #32383e;
    }

    .table-dark.table-bordered {
        border: 0;
    }

    .table-dark.table-striped tbody tr:nth-of-type(odd) {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .table-dark.table-hover tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.075);
    }

    @media (max-width: 575px) {
        .table-responsive-sm {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: -ms-autohiding-scrollbar;
        }

        .table-responsive-sm.table-bordered {
            border: 0;
        }
    }

    @media (max-width: 767px) {
        .table-responsive-md {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: -ms-autohiding-scrollbar;
        }

        .table-responsive-md.table-bordered {
            border: 0;
        }
    }

    @media (max-width: 991px) {
        .table-responsive-lg {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: -ms-autohiding-scrollbar;
        }

        .table-responsive-lg.table-bordered {
            border: 0;
        }
    }

    @media (max-width: 1199px) {
        .table-responsive-xl {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: -ms-autohiding-scrollbar;
        }

        .table-responsive-xl.table-bordered {
            border: 0;
        }
    }

    .table-responsive {
        display: block;
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        -ms-overflow-style: -ms-autohiding-scrollbar;
    }

    .table-responsive.table-bordered {
        border: 0;
    }

    .form-control {
        display: block;
        width: 100%;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        color: #495057;
        background-color: #ffffff;
        background-image: none;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
    }

    .form-control::-ms-expand {
        background-color: transparent;
        border: 0;
    }

    .form-control:focus {
        color: #495057;
        background-color: #ffffff;
        border-color: #d8d0fb;
        outline: none;
        box-shadow: 0 0 0 0.2rem rgba(116, 90, 242, 0.25);
    }

    .form-control::-webkit-input-placeholder {
        color: #868e96;
        opacity: 1;
    }

    .form-control:-ms-input-placeholder {
        color: #868e96;
        opacity: 1;
    }

    .form-control::placeholder {
        color: #868e96;
        opacity: 1;
    }

    .form-control:disabled, .form-control[readonly] {
        background-color: #e9ecef;
        opacity: 1;
    }

    select.form-control:not([size]):not([multiple]) {
        height: calc(2.25rem + 2px);
    }

    select.form-control:focus::-ms-value {
        color: #495057;
        background-color: #ffffff;
    }

    .form-control-file,
    .form-control-range {
        display: block;
    }

    .col-form-label {
        padding-top: calc(0.375rem + 1px);
        padding-bottom: calc(0.375rem + 1px);
        margin-bottom: 0;
        line-height: 1.5;
    }

    .col-form-label-lg {
        padding-top: calc(0.5rem + 1px);
        padding-bottom: calc(0.5rem + 1px);
        font-size: 1.25rem;
        line-height: 1.5;
    }

    .col-form-label-sm {
        padding-top: calc(0.25rem + 1px);
        padding-bottom: calc(0.25rem + 1px);
        font-size: 0.875rem;
        line-height: 1.5;
    }

    .col-form-legend {
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
        margin-bottom: 0;
        font-size: 1rem;
    }

    .form-control-plaintext {
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
        margin-bottom: 0;
        line-height: 1.5;
        background-color: transparent;
        border: solid transparent;
        border-width: 1px 0;
    }

    .form-control-plaintext.form-control-sm, .input-group-sm > .form-control-plaintext.form-control,
    .input-group-sm > .form-control-plaintext.input-group-addon,
    .input-group-sm > .input-group-btn > .form-control-plaintext.btn, .form-control-plaintext.form-control-lg, .input-group-lg > .form-control-plaintext.form-control,
    .input-group-lg > .form-control-plaintext.input-group-addon,
    .input-group-lg > .input-group-btn > .form-control-plaintext.btn {
        padding-right: 0;
        padding-left: 0;
    }

    .form-control-sm, .input-group-sm > .form-control,
    .input-group-sm > .input-group-addon,
    .input-group-sm > .input-group-btn > .btn {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
        border-radius: 0.2rem;
    }

    select.form-control-sm:not([size]):not([multiple]), .input-group-sm > select.form-control:not([size]):not([multiple]),
    .input-group-sm > select.input-group-addon:not([size]):not([multiple]),
    .input-group-sm > .input-group-btn > select.btn:not([size]):not([multiple]) {
        height: calc(1.8125rem + 2px);
    }

    .form-control-lg, .input-group-lg > .form-control,
    .input-group-lg > .input-group-addon,
    .input-group-lg > .input-group-btn > .btn {
        padding: 0.5rem 1rem;
        font-size: 1.25rem;
        line-height: 1.5;
        border-radius: 0.3rem;
    }

    select.form-control-lg:not([size]):not([multiple]), .input-group-lg > select.form-control:not([size]):not([multiple]),
    .input-group-lg > select.input-group-addon:not([size]):not([multiple]),
    .input-group-lg > .input-group-btn > select.btn:not([size]):not([multiple]) {
        height: calc(2.875rem + 2px);
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-text {
        display: block;
        margin-top: 0.25rem;
    }

    .form-row {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        margin-right: -5px;
        margin-left: -5px;
    }

    .form-row > .col,
    .form-row > [class*="col-"] {
        padding-right: 5px;
        padding-left: 5px;
    }

    .form-check {
        position: relative;
        display: block;
        margin-bottom: 0.5rem;
    }

    .form-check.disabled .form-check-label {
        color: #868e96;
    }

    .form-check-label {
        padding-left: 1.25rem;
        margin-bottom: 0;
    }

    .form-check-input {
        position: absolute;
        margin-top: 0.25rem;
        margin-left: -1.25rem;
    }

    .form-check-inline {
        display: inline-block;
        margin-right: 0.75rem;
    }

    .form-check-inline .form-check-label {
        vertical-align: middle;
    }

    .valid-feedback {
        display: none;
        margin-top: .25rem;
        font-size: .875rem;
        color: #06d79c;
    }

    .valid-tooltip {
        position: absolute;
        top: 100%;
        z-index: 5;
        display: none;
        width: 250px;
        padding: .5rem;
        margin-top: .1rem;
        font-size: .875rem;
        line-height: 1;
        color: #fff;
        background-color: rgba(6, 215, 156, 0.8);
        border-radius: .2rem;
    }

    .was-validated .form-control:valid, .form-control.is-valid, .was-validated
    .custom-select:valid,
    .custom-select.is-valid {
        border-color: #06d79c;
    }

    .was-validated .form-control:valid:focus, .form-control.is-valid:focus, .was-validated
    .custom-select:valid:focus,
    .custom-select.is-valid:focus {
        box-shadow: 0 0 0 0.2rem rgba(6, 215, 156, 0.25);
    }

    .was-validated .form-control:valid ~ .valid-feedback,
    .was-validated .form-control:valid ~ .valid-tooltip, .form-control.is-valid ~ .valid-feedback,
    .form-control.is-valid ~ .valid-tooltip, .was-validated
    .custom-select:valid ~ .valid-feedback,
    .was-validated
    .custom-select:valid ~ .valid-tooltip,
    .custom-select.is-valid ~ .valid-feedback,
    .custom-select.is-valid ~ .valid-tooltip {
        display: block;
    }

    .was-validated .form-check-input:valid + .form-check-label, .form-check-input.is-valid + .form-check-label {
        color: #06d79c;
    }

    .was-validated .custom-control-input:valid ~ .custom-control-indicator, .custom-control-input.is-valid ~ .custom-control-indicator {
        background-color: rgba(6, 215, 156, 0.25);
    }

    .was-validated .custom-control-input:valid ~ .custom-control-description, .custom-control-input.is-valid ~ .custom-control-description {
        color: #06d79c;
    }

    .was-validated .custom-file-input:valid ~ .custom-file-control, .custom-file-input.is-valid ~ .custom-file-control {
        border-color: #06d79c;
    }

    .was-validated .custom-file-input:valid ~ .custom-file-control::before, .custom-file-input.is-valid ~ .custom-file-control::before {
        border-color: inherit;
    }

    .was-validated .custom-file-input:valid:focus, .custom-file-input.is-valid:focus {
        box-shadow: 0 0 0 0.2rem rgba(6, 215, 156, 0.25);
    }

    .invalid-feedback {
        display: none;
        margin-top: .25rem;
        font-size: .875rem;
        color: #ef5350;
    }

    .invalid-tooltip {
        position: absolute;
        top: 100%;
        z-index: 5;
        display: none;
        width: 250px;
        padding: .5rem;
        margin-top: .1rem;
        font-size: .875rem;
        line-height: 1;
        color: #fff;
        background-color: rgba(239, 83, 80, 0.8);
        border-radius: .2rem;
    }

    .was-validated .form-control:invalid, .form-control.is-invalid, .was-validated
    .custom-select:invalid,
    .custom-select.is-invalid {
        border-color: #ef5350;
    }

    .was-validated .form-control:invalid:focus, .form-control.is-invalid:focus, .was-validated
    .custom-select:invalid:focus,
    .custom-select.is-invalid:focus {
        box-shadow: 0 0 0 0.2rem rgba(239, 83, 80, 0.25);
    }

    .was-validated .form-control:invalid ~ .invalid-feedback,
    .was-validated .form-control:invalid ~ .invalid-tooltip, .form-control.is-invalid ~ .invalid-feedback,
    .form-control.is-invalid ~ .invalid-tooltip, .was-validated
    .custom-select:invalid ~ .invalid-feedback,
    .was-validated
    .custom-select:invalid ~ .invalid-tooltip,
    .custom-select.is-invalid ~ .invalid-feedback,
    .custom-select.is-invalid ~ .invalid-tooltip {
        display: block;
    }

    .was-validated .form-check-input:invalid + .form-check-label, .form-check-input.is-invalid + .form-check-label {
        color: #ef5350;
    }

    .was-validated .custom-control-input:invalid ~ .custom-control-indicator, .custom-control-input.is-invalid ~ .custom-control-indicator {
        background-color: rgba(239, 83, 80, 0.25);
    }

    .was-validated .custom-control-input:invalid ~ .custom-control-description, .custom-control-input.is-invalid ~ .custom-control-description {
        color: #ef5350;
    }

    .was-validated .custom-file-input:invalid ~ .custom-file-control, .custom-file-input.is-invalid ~ .custom-file-control {
        border-color: #ef5350;
    }

    .was-validated .custom-file-input:invalid ~ .custom-file-control::before, .custom-file-input.is-invalid ~ .custom-file-control::before {
        border-color: inherit;
    }

    .was-validated .custom-file-input:invalid:focus, .custom-file-input.is-invalid:focus {
        box-shadow: 0 0 0 0.2rem rgba(239, 83, 80, 0.25);
    }

    .form-inline {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: horizontal;
        -webkit-box-direction: normal;
        -ms-flex-flow: row wrap;
        flex-flow: row wrap;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
    }

    .form-inline .form-check {
        width: 100%;
    }

    @media (min-width: 576px) {
        .form-inline label {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            margin-bottom: 0;
        }

        .form-inline .form-group {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-flex: 0;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row wrap;
            flex-flow: row wrap;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            margin-bottom: 0;
        }

        .form-inline .form-control {
            display: inline-block;
            width: auto;
            vertical-align: middle;
        }

        .form-inline .form-control-plaintext {
            display: inline-block;
        }

        .form-inline .input-group {
            width: auto;
        }

        .form-inline .form-check {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            width: auto;
            margin-top: 0;
            margin-bottom: 0;
        }

        .form-inline .form-check-label {
            padding-left: 0;
        }

        .form-inline .form-check-input {
            position: relative;
            margin-top: 0;
            margin-right: 0.25rem;
            margin-left: 0;
        }

        .form-inline .custom-control {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            padding-left: 0;
        }

        .form-inline .custom-control-indicator {
            position: static;
            display: inline-block;
            margin-right: 0.25rem;
            vertical-align: text-bottom;
        }

        .form-inline .has-feedback .form-control-feedback {
            top: 0;
        }
    }

    .btn {
        display: inline-block;
        font-weight: 400;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: 1px solid transparent;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: 0.25rem;
        transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .btn:focus, .btn:hover {
        text-decoration: none;
    }

    .btn:focus, .btn.focus {
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(116, 90, 242, 0.25);
    }

    .btn.disabled, .btn:disabled {
        opacity: .65;
    }

    .btn:not([disabled]):not(.disabled):active, .btn:not([disabled]):not(.disabled).active {
        background-image: none;
    }

    a.btn.disabled,
    fieldset[disabled] a.btn {
        pointer-events: none;
    }

    .btn-primary {
        color: #fff;
        background-color: #745af2;
        border-color: #745af2;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #5637ef;
        border-color: #4c2bee;
    }

    .btn-primary:focus, .btn-primary.focus {
        box-shadow: 0 0 0 0.2rem rgba(116, 90, 242, 0.5);
    }

    .btn-primary.disabled, .btn-primary:disabled {
        background-color: #745af2;
        border-color: #745af2;
    }

    .btn-primary:not([disabled]):not(.disabled):active, .btn-primary:not([disabled]):not(.disabled).active,
    .show > .btn-primary.dropdown-toggle {
        color: #fff;
        background-color: #4c2bee;
        border-color: #421fed;
        box-shadow: 0 0 0 0.2rem rgba(116, 90, 242, 0.5);
    }

    .btn-secondary {
        color: #111;
        background-color: #cccccc;
        border-color: #cccccc;
    }

    .btn-secondary:hover {
        color: #111;
        background-color: #b9b9b9;
        border-color: #b3b2b2;
    }

    .btn-secondary:focus, .btn-secondary.focus {
        box-shadow: 0 0 0 0.2rem rgba(204, 204, 204, 0.5);
    }

    .btn-secondary.disabled, .btn-secondary:disabled {
        background-color: #cccccc;
        border-color: #cccccc;
    }

    .btn-secondary:not([disabled]):not(.disabled):active, .btn-secondary:not([disabled]):not(.disabled).active,
    .show > .btn-secondary.dropdown-toggle {
        color: #111;
        background-color: #b3b2b2;
        border-color: #acacac;
        box-shadow: 0 0 0 0.2rem rgba(204, 204, 204, 0.5);
    }

    .btn-success {
        color: #fff;
        background-color: #06d79c;
        border-color: #06d79c;
    }

    .btn-success:hover {
        color: #fff;
        background-color: #05b281;
        border-color: #05a578;
    }

    .btn-success:focus, .btn-success.focus {
        box-shadow: 0 0 0 0.2rem rgba(6, 215, 156, 0.5);
    }

    .btn-success.disabled, .btn-success:disabled {
        background-color: #06d79c;
        border-color: #06d79c;
    }

    .btn-success:not([disabled]):not(.disabled):active, .btn-success:not([disabled]):not(.disabled).active,
    .show > .btn-success.dropdown-toggle {
        color: #fff;
        background-color: #05a578;
        border-color: #04996f;
        box-shadow: 0 0 0 0.2rem rgba(6, 215, 156, 0.5);
    }

    .btn-info {
        color: #fff;
        background-color: #398bf7;
        border-color: #398bf7;
    }

    .btn-info:hover {
        color: #fff;
        background-color: #1475f6;
        border-color: #0a6ff3;
    }

    .btn-info:focus, .btn-info.focus {
        box-shadow: 0 0 0 0.2rem rgba(57, 139, 247, 0.5);
    }

    .btn-info.disabled, .btn-info:disabled {
        background-color: #398bf7;
        border-color: #398bf7;
    }

    .btn-info:not([disabled]):not(.disabled):active, .btn-info:not([disabled]):not(.disabled).active,
    .show > .btn-info.dropdown-toggle {
        color: #fff;
        background-color: #0a6ff3;
        border-color: #0969e7;
        box-shadow: 0 0 0 0.2rem rgba(57, 139, 247, 0.5);
    }

    .btn-warning {
        color: #111;
        background-color: #ffb22b;
        border-color: #ffb22b;
    }

    .btn-warning:hover {
        color: #111;
        background-color: #ffa405;
        border-color: #f79d00;
    }

    .btn-warning:focus, .btn-warning.focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 178, 43, 0.5);
    }

    .btn-warning.disabled, .btn-warning:disabled {
        background-color: #ffb22b;
        border-color: #ffb22b;
    }

    .btn-warning:not([disabled]):not(.disabled):active, .btn-warning:not([disabled]):not(.disabled).active,
    .show > .btn-warning.dropdown-toggle {
        color: #111;
        background-color: #f79d00;
        border-color: #ea9500;
        box-shadow: 0 0 0 0.2rem rgba(255, 178, 43, 0.5);
    }

    .btn-danger {
        color: #fff;
        background-color: #ef5350;
        border-color: #ef5350;
    }

    .btn-danger:hover {
        color: #fff;
        background-color: #ec312d;
        border-color: #eb2521;
    }

    .btn-danger:focus, .btn-danger.focus {
        box-shadow: 0 0 0 0.2rem rgba(239, 83, 80, 0.5);
    }

    .btn-danger.disabled, .btn-danger:disabled {
        background-color: #ef5350;
        border-color: #ef5350;
    }

    .btn-danger:not([disabled]):not(.disabled):active, .btn-danger:not([disabled]):not(.disabled).active,
    .show > .btn-danger.dropdown-toggle {
        color: #fff;
        background-color: #eb2521;
        border-color: #ea1a16;
        box-shadow: 0 0 0 0.2rem rgba(239, 83, 80, 0.5);
    }

    .btn-light {
        color: #111;
        background-color: #e9edf2;
        border-color: #e9edf2;
    }

    .btn-light:hover {
        color: #111;
        background-color: #d1d9e4;
        border-color: #c9d3df;
    }

    .btn-light:focus, .btn-light.focus {
        box-shadow: 0 0 0 0.2rem rgba(233, 237, 242, 0.5);
    }

    .btn-light.disabled, .btn-light:disabled {
        background-color: #e9edf2;
        border-color: #e9edf2;
    }

    .btn-light:not([disabled]):not(.disabled):active, .btn-light:not([disabled]):not(.disabled).active,
    .show > .btn-light.dropdown-toggle {
        color: #111;
        background-color: #c9d3df;
        border-color: #c1ccda;
        box-shadow: 0 0 0 0.2rem rgba(233, 237, 242, 0.5);
    }

    .btn-dark {
        color: #fff;
        background-color: #263238;
        border-color: #263238;
    }

    .btn-dark:hover {
        color: #fff;
        background-color: #171e21;
        border-color: #11171a;
    }

    .btn-dark:focus, .btn-dark.focus {
        box-shadow: 0 0 0 0.2rem rgba(38, 50, 56, 0.5);
    }

    .btn-dark.disabled, .btn-dark:disabled {
        background-color: #263238;
        border-color: #263238;
    }

    .btn-dark:not([disabled]):not(.disabled):active, .btn-dark:not([disabled]):not(.disabled).active,
    .show > .btn-dark.dropdown-toggle {
        color: #fff;
        background-color: #11171a;
        border-color: #0c1012;
        box-shadow: 0 0 0 0.2rem rgba(38, 50, 56, 0.5);
    }

    .btn-outline-primary {
        color: #745af2;
        background-color: transparent;
        background-image: none;
        border-color: #745af2;
    }

    .btn-outline-primary:hover {
        color: #ffffff;
        background-color: #745af2;
        border-color: #745af2;
    }

    .btn-outline-primary:focus, .btn-outline-primary.focus {
        box-shadow: 0 0 0 0.2rem rgba(116, 90, 242, 0.5);
    }

    .btn-outline-primary.disabled, .btn-outline-primary:disabled {
        color: #745af2;
        background-color: transparent;
    }

    .btn-outline-primary:not([disabled]):not(.disabled):active, .btn-outline-primary:not([disabled]):not(.disabled).active,
    .show > .btn-outline-primary.dropdown-toggle {
        color: #ffffff;
        background-color: #745af2;
        border-color: #745af2;
        box-shadow: 0 0 0 0.2rem rgba(116, 90, 242, 0.5);
    }

    .btn-outline-secondary {
        color: #cccccc;
        background-color: transparent;
        background-image: none;
        border-color: #cccccc;
    }

    .btn-outline-secondary:hover {
        color: #ffffff;
        background-color: #cccccc;
        border-color: #cccccc;
    }

    .btn-outline-secondary:focus, .btn-outline-secondary.focus {
        box-shadow: 0 0 0 0.2rem rgba(204, 204, 204, 0.5);
    }

    .btn-outline-secondary.disabled, .btn-outline-secondary:disabled {
        color: #cccccc;
        background-color: transparent;
    }

    .btn-outline-secondary:not([disabled]):not(.disabled):active, .btn-outline-secondary:not([disabled]):not(.disabled).active,
    .show > .btn-outline-secondary.dropdown-toggle {
        color: #ffffff;
        background-color: #cccccc;
        border-color: #cccccc;
        box-shadow: 0 0 0 0.2rem rgba(204, 204, 204, 0.5);
    }

    .btn-outline-success {
        color: #06d79c;
        background-color: transparent;
        background-image: none;
        border-color: #06d79c;
    }

    .btn-outline-success:hover {
        color: #ffffff;
        background-color: #06d79c;
        border-color: #06d79c;
    }

    .btn-outline-success:focus, .btn-outline-success.focus {
        box-shadow: 0 0 0 0.2rem rgba(6, 215, 156, 0.5);
    }

    .btn-outline-success.disabled, .btn-outline-success:disabled {
        color: #06d79c;
        background-color: transparent;
    }

    .btn-outline-success:not([disabled]):not(.disabled):active, .btn-outline-success:not([disabled]):not(.disabled).active,
    .show > .btn-outline-success.dropdown-toggle {
        color: #ffffff;
        background-color: #06d79c;
        border-color: #06d79c;
        box-shadow: 0 0 0 0.2rem rgba(6, 215, 156, 0.5);
    }

    .btn-outline-info {
        color: #398bf7;
        background-color: transparent;
        background-image: none;
        border-color: #398bf7;
    }

    .btn-outline-info:hover {
        color: #ffffff;
        background-color: #398bf7;
        border-color: #398bf7;
    }

    .btn-outline-info:focus, .btn-outline-info.focus {
        box-shadow: 0 0 0 0.2rem rgba(57, 139, 247, 0.5);
    }

    .btn-outline-info.disabled, .btn-outline-info:disabled {
        color: #398bf7;
        background-color: transparent;
    }

    .btn-outline-info:not([disabled]):not(.disabled):active, .btn-outline-info:not([disabled]):not(.disabled).active,
    .show > .btn-outline-info.dropdown-toggle {
        color: #ffffff;
        background-color: #398bf7;
        border-color: #398bf7;
        box-shadow: 0 0 0 0.2rem rgba(57, 139, 247, 0.5);
    }

    .btn-outline-warning {
        color: #ffb22b;
        background-color: transparent;
        background-image: none;
        border-color: #ffb22b;
    }

    .btn-outline-warning:hover {
        color: #ffffff;
        background-color: #ffb22b;
        border-color: #ffb22b;
    }

    .btn-outline-warning:focus, .btn-outline-warning.focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 178, 43, 0.5);
    }

    .btn-outline-warning.disabled, .btn-outline-warning:disabled {
        color: #ffb22b;
        background-color: transparent;
    }

    .btn-outline-warning:not([disabled]):not(.disabled):active, .btn-outline-warning:not([disabled]):not(.disabled).active,
    .show > .btn-outline-warning.dropdown-toggle {
        color: #ffffff;
        background-color: #ffb22b;
        border-color: #ffb22b;
        box-shadow: 0 0 0 0.2rem rgba(255, 178, 43, 0.5);
    }

    .btn-outline-danger {
        color: #ef5350;
        background-color: transparent;
        background-image: none;
        border-color: #ef5350;
    }

    .btn-outline-danger:hover {
        color: #ffffff;
        background-color: #ef5350;
        border-color: #ef5350;
    }

    .btn-outline-danger:focus, .btn-outline-danger.focus {
        box-shadow: 0 0 0 0.2rem rgba(239, 83, 80, 0.5);
    }

    .btn-outline-danger.disabled, .btn-outline-danger:disabled {
        color: #ef5350;
        background-color: transparent;
    }

    .btn-outline-danger:not([disabled]):not(.disabled):active, .btn-outline-danger:not([disabled]):not(.disabled).active,
    .show > .btn-outline-danger.dropdown-toggle {
        color: #ffffff;
        background-color: #ef5350;
        border-color: #ef5350;
        box-shadow: 0 0 0 0.2rem rgba(239, 83, 80, 0.5);
    }

    .btn-outline-light {
        color: #e9edf2;
        background-color: transparent;
        background-image: none;
        border-color: #e9edf2;
    }

    .btn-outline-light:hover {
        color: #212529;
        background-color: #e9edf2;
        border-color: #e9edf2;
    }

    .btn-outline-light:focus, .btn-outline-light.focus {
        box-shadow: 0 0 0 0.2rem rgba(233, 237, 242, 0.5);
    }

    .btn-outline-light.disabled, .btn-outline-light:disabled {
        color: #e9edf2;
        background-color: transparent;
    }

    .btn-outline-light:not([disabled]):not(.disabled):active, .btn-outline-light:not([disabled]):not(.disabled).active,
    .show > .btn-outline-light.dropdown-toggle {
        color: #212529;
        background-color: #e9edf2;
        border-color: #e9edf2;
        box-shadow: 0 0 0 0.2rem rgba(233, 237, 242, 0.5);
    }

    .btn-outline-dark {
        color: #263238;
        background-color: transparent;
        background-image: none;
        border-color: #263238;
    }

    .btn-outline-dark:hover {
        color: #ffffff;
        background-color: #263238;
        border-color: #263238;
    }

    .btn-outline-dark:focus, .btn-outline-dark.focus {
        box-shadow: 0 0 0 0.2rem rgba(38, 50, 56, 0.5);
    }

    .btn-outline-dark.disabled, .btn-outline-dark:disabled {
        color: #263238;
        background-color: transparent;
    }

    .btn-outline-dark:not([disabled]):not(.disabled):active, .btn-outline-dark:not([disabled]):not(.disabled).active,
    .show > .btn-outline-dark.dropdown-toggle {
        color: #ffffff;
        background-color: #263238;
        border-color: #263238;
        box-shadow: 0 0 0 0.2rem rgba(38, 50, 56, 0.5);
    }

    .btn-link {
        font-weight: 400;
        color: #745af2;
        background-color: transparent;
    }

    .btn-link:hover {
        color: #3813ec;
        text-decoration: underline;
        background-color: transparent;
        border-color: transparent;
    }

    .btn-link:focus, .btn-link.focus {
        border-color: transparent;
        box-shadow: none;
    }

    .btn-link:disabled, .btn-link.disabled {
        color: #868e96;
    }

    .btn-lg, .btn-group-lg > .btn {
        padding: 0.5rem 1rem;
        font-size: 1.25rem;
        line-height: 1.5;
        border-radius: 0.3rem;
    }

    .btn-sm, .btn-group-sm > .btn {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
        border-radius: 0.2rem;
    }

    .btn-block {
        display: block;
        width: 100%;
    }

    .btn-block + .btn-block {
        margin-top: 0.5rem;
    }

    input[type="submit"].btn-block,
    input[type="reset"].btn-block,
    input[type="button"].btn-block {
        width: 100%;
    }

    .fade {
        opacity: 0;
        transition: opacity 0.15s linear;
    }

    .fade.show {
        opacity: 1;
    }

    .collapse {
        display: none;
    }

    .collapse.show {
        display: block;
    }

    tr.collapse.show {
        display: table-row;
    }

    tbody.collapse.show {
        display: table-row-group;
    }

    .collapsing {
        position: relative;
        height: 0;
        overflow: hidden;
        transition: height 0.35s ease;
    }

    .dropup,
    .dropdown {
        position: relative;
    }

    .dropdown-toggle::after {
        display: inline-block;
        width: 0;
        height: 0;
        margin-left: 0.255em;
        vertical-align: 0.255em;
        content: "";
        border-top: 0.3em solid;
        border-right: 0.3em solid transparent;
        border-bottom: 0;
        border-left: 0.3em solid transparent;
    }

    .dropdown-toggle:empty::after {
        margin-left: 0;
    }

    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1000;
        display: none;
        float: left;
        min-width: 10rem;
        padding: 0.5rem 0;
        margin: 0.125rem 0 0;
        font-size: 1rem;
        color: #212529;
        text-align: left;
        list-style: none;
        background-color: #ffffff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.25rem;
    }

    .dropup .dropdown-menu {
        margin-top: 0;
        margin-bottom: 0.125rem;
    }

    .dropup .dropdown-toggle::after {
        display: inline-block;
        width: 0;
        height: 0;
        margin-left: 0.255em;
        vertical-align: 0.255em;
        content: "";
        border-top: 0;
        border-right: 0.3em solid transparent;
        border-bottom: 0.3em solid;
        border-left: 0.3em solid transparent;
    }

    .dropup .dropdown-toggle:empty::after {
        margin-left: 0;
    }

    .dropdown-divider {
        height: 0;
        margin: 0.5rem 0;
        overflow: hidden;
        border-top: 1px solid #e9ecef;
    }

    .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.25rem 1.5rem;
        clear: both;
        font-weight: 400;
        color: #212529;
        text-align: inherit;
        white-space: nowrap;
        background: none;
        border: 0;
    }

    .dropdown-item:focus, .dropdown-item:hover {
        color: #16181b;
        text-decoration: none;
        background-color: #f8f9fa;
    }

    .dropdown-item.active, .dropdown-item:active {
        color: #ffffff;
        text-decoration: none;
        background-color: #745af2;
    }

    .dropdown-item.disabled, .dropdown-item:disabled {
        color: #868e96;
        background-color: transparent;
    }

    .dropdown-menu.show {
        display: block;
    }

    .dropdown-header {
        display: block;
        padding: 0.5rem 1.5rem;
        margin-bottom: 0;
        font-size: 0.875rem;
        color: #868e96;
        white-space: nowrap;
    }

    .btn-group,
    .btn-group-vertical {
        position: relative;
        display: -webkit-inline-box;
        display: -ms-inline-flexbox;
        display: inline-flex;
        vertical-align: middle;
    }

    .btn-group > .btn,
    .btn-group-vertical > .btn {
        position: relative;
        -webkit-box-flex: 0;
        -ms-flex: 0 1 auto;
        flex: 0 1 auto;
    }

    .btn-group > .btn:hover,
    .btn-group-vertical > .btn:hover {
        z-index: 2;
    }

    .btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active,
    .btn-group-vertical > .btn:focus,
    .btn-group-vertical > .btn:active,
    .btn-group-vertical > .btn.active {
        z-index: 2;
    }

    .btn-group .btn + .btn,
    .btn-group .btn + .btn-group,
    .btn-group .btn-group + .btn,
    .btn-group .btn-group + .btn-group,
    .btn-group-vertical .btn + .btn,
    .btn-group-vertical .btn + .btn-group,
    .btn-group-vertical .btn-group + .btn,
    .btn-group-vertical .btn-group + .btn-group {
        margin-left: -1px;
    }

    .btn-toolbar {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        -webkit-box-pack: start;
        -ms-flex-pack: start;
        justify-content: flex-start;
    }

    .btn-toolbar .input-group {
        width: auto;
    }

    .btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {
        border-radius: 0;
    }

    .btn-group > .btn:first-child {
        margin-left: 0;
    }

    .btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .btn-group > .btn:last-child:not(:first-child),
    .btn-group > .dropdown-toggle:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .btn-group > .btn-group {
        float: left;
    }

    .btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {
        border-radius: 0;
    }

    .btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,
    .btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .btn + .dropdown-toggle-split {
        padding-right: 0.5625rem;
        padding-left: 0.5625rem;
    }

    .btn + .dropdown-toggle-split::after {
        margin-left: 0;
    }

    .btn-sm + .dropdown-toggle-split, .btn-group-sm > .btn + .dropdown-toggle-split {
        padding-right: 0.375rem;
        padding-left: 0.375rem;
    }

    .btn-lg + .dropdown-toggle-split, .btn-group-lg > .btn + .dropdown-toggle-split {
        padding-right: 0.75rem;
        padding-left: 0.75rem;
    }

    .btn-group-vertical {
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        -webkit-box-align: start;
        -ms-flex-align: start;
        align-items: flex-start;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
    }

    .btn-group-vertical .btn,
    .btn-group-vertical .btn-group {
        width: 100%;
    }

    .btn-group-vertical > .btn + .btn,
    .btn-group-vertical > .btn + .btn-group,
    .btn-group-vertical > .btn-group + .btn,
    .btn-group-vertical > .btn-group + .btn-group {
        margin-top: -1px;
        margin-left: 0;
    }

    .btn-group-vertical > .btn:not(:first-child):not(:last-child) {
        border-radius: 0;
    }

    .btn-group-vertical > .btn:first-child:not(:last-child) {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .btn-group-vertical > .btn:last-child:not(:first-child) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {
        border-radius: 0;
    }

    .btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,
    .btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    [data-toggle="buttons"] > .btn input[type="radio"],
    [data-toggle="buttons"] > .btn input[type="checkbox"],
    [data-toggle="buttons"] > .btn-group > .btn input[type="radio"],
    [data-toggle="buttons"] > .btn-group > .btn input[type="checkbox"] {
        position: absolute;
        clip: rect(0, 0, 0, 0);
        pointer-events: none;
    }

    .input-group {
        position: relative;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: stretch;
        -ms-flex-align: stretch;
        align-items: stretch;
        width: 100%;
    }

    .input-group .form-control {
        position: relative;
        z-index: 2;
        -webkit-box-flex: 1;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        width: 1%;
        margin-bottom: 0;
    }

    .input-group .form-control:focus, .input-group .form-control:active, .input-group .form-control:hover {
        z-index: 3;
    }

    .input-group-addon,
    .input-group-btn,
    .input-group .form-control {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
    }

    .input-group-addon:not(:first-child):not(:last-child),
    .input-group-btn:not(:first-child):not(:last-child),
    .input-group .form-control:not(:first-child):not(:last-child) {
        border-radius: 0;
    }

    .input-group-addon,
    .input-group-btn {
        white-space: nowrap;
    }

    .input-group-addon {
        padding: 0.375rem 0.75rem;
        margin-bottom: 0;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #495057;
        text-align: center;
        background-color: #e9ecef;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
    }

    .input-group-addon.form-control-sm,
    .input-group-sm > .input-group-addon,
    .input-group-sm > .input-group-btn > .input-group-addon.btn {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        border-radius: 0.2rem;
    }

    .input-group-addon.form-control-lg,
    .input-group-lg > .input-group-addon,
    .input-group-lg > .input-group-btn > .input-group-addon.btn {
        padding: 0.5rem 1rem;
        font-size: 1.25rem;
        border-radius: 0.3rem;
    }

    .input-group-addon input[type="radio"],
    .input-group-addon input[type="checkbox"] {
        margin-top: 0;
    }

    .input-group .form-control:not(:last-child),
    .input-group-addon:not(:last-child),
    .input-group-btn:not(:last-child) > .btn,
    .input-group-btn:not(:last-child) > .btn-group > .btn,
    .input-group-btn:not(:last-child) > .dropdown-toggle,
    .input-group-btn:not(:first-child) > .btn:not(:last-child):not(.dropdown-toggle),
    .input-group-btn:not(:first-child) > .btn-group:not(:last-child) > .btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .input-group-addon:not(:last-child) {
        border-right: 0;
    }

    .input-group .form-control:not(:first-child),
    .input-group-addon:not(:first-child),
    .input-group-btn:not(:first-child) > .btn,
    .input-group-btn:not(:first-child) > .btn-group > .btn,
    .input-group-btn:not(:first-child) > .dropdown-toggle,
    .input-group-btn:not(:last-child) > .btn:not(:first-child),
    .input-group-btn:not(:last-child) > .btn-group:not(:first-child) > .btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-control + .input-group-addon:not(:first-child) {
        border-left: 0;
    }

    .input-group-btn {
        position: relative;
        -webkit-box-align: stretch;
        -ms-flex-align: stretch;
        align-items: stretch;
        font-size: 0;
        white-space: nowrap;
    }

    .input-group-btn > .btn {
        position: relative;
    }

    .input-group-btn > .btn + .btn {
        margin-left: -1px;
    }

    .input-group-btn > .btn:focus, .input-group-btn > .btn:active, .input-group-btn > .btn:hover {
        z-index: 3;
    }

    .input-group-btn:first-child > .btn + .btn {
        margin-left: 0;
    }

    .input-group-btn:not(:last-child) > .btn,
    .input-group-btn:not(:last-child) > .btn-group {
        margin-right: -1px;
    }

    .input-group-btn:not(:first-child) > .btn,
    .input-group-btn:not(:first-child) > .btn-group {
        z-index: 2;
        margin-left: 0;
    }

    .input-group-btn:not(:first-child) > .btn:first-child,
    .input-group-btn:not(:first-child) > .btn-group:first-child {
        margin-left: -1px;
    }

    .input-group-btn:not(:first-child) > .btn:focus, .input-group-btn:not(:first-child) > .btn:active, .input-group-btn:not(:first-child) > .btn:hover,
    .input-group-btn:not(:first-child) > .btn-group:focus,
    .input-group-btn:not(:first-child) > .btn-group:active,
    .input-group-btn:not(:first-child) > .btn-group:hover {
        z-index: 3;
    }

    .custom-control {
        position: relative;
        display: -webkit-inline-box;
        display: -ms-inline-flexbox;
        display: inline-flex;
        min-height: 1.5rem;
        padding-left: 1.5rem;
        margin-right: 1rem;
    }

    .custom-control-input {
        position: absolute;
        z-index: -1;
        opacity: 0;
    }

    .custom-control-input:checked ~ .custom-control-indicator {
        color: #ffffff;
        background-color: #745af2;
    }

    .custom-control-input:focus ~ .custom-control-indicator {
        box-shadow: 0 0 0 1px #ffffff, 0 0 0 0.2rem rgba(116, 90, 242, 0.25);
    }

    .custom-control-input:active ~ .custom-control-indicator {
        color: #ffffff;
        background-color: white;
    }

    .custom-control-input:disabled ~ .custom-control-indicator {
        background-color: #e9ecef;
    }

    .custom-control-input:disabled ~ .custom-control-description {
        color: #868e96;
    }

    .custom-control-indicator {
        position: absolute;
        top: 0.25rem;
        left: 0;
        display: block;
        width: 1rem;
        height: 1rem;
        pointer-events: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: #ddd;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 50% 50%;
    }

    .custom-checkbox .custom-control-indicator {
        border-radius: 0.25rem;
    }

    .custom-checkbox .custom-control-input:checked ~ .custom-control-indicator {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%23ffffff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3E%3C/svg%3E");
    }

    .custom-checkbox .custom-control-input:indeterminate ~ .custom-control-indicator {
        background-color: #745af2;
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Cpath stroke='%23ffffff' d='M0 2h4'/%3E%3C/svg%3E");
    }

    .custom-radio .custom-control-indicator {
        border-radius: 50%;
    }

    .custom-radio .custom-control-input:checked ~ .custom-control-indicator {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3E%3Ccircle r='3' fill='%23ffffff'/%3E%3C/svg%3E");
    }

    .custom-controls-stacked {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
    }

    .custom-controls-stacked .custom-control {
        margin-bottom: 0.25rem;
    }

    .custom-controls-stacked .custom-control + .custom-control {
        margin-left: 0;
    }

    .custom-select {
        display: inline-block;
        max-width: 100%;
        height: calc(2.25rem + 2px);
        padding: 0.375rem 1.75rem 0.375rem 0.75rem;
        line-height: 1.5;
        color: #495057;
        vertical-align: middle;
        background: #ffffff url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23333' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E") no-repeat right 0.75rem center;
        background-size: 8px 10px;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    .custom-select:focus {
        border-color: #d8d0fb;
        outline: none;
    }

    .custom-select:focus::-ms-value {
        color: #495057;
        background-color: #ffffff;
    }

    .custom-select[multiple] {
        height: auto;
        background-image: none;
    }

    .custom-select:disabled {
        color: #868e96;
        background-color: #e9ecef;
    }

    .custom-select::-ms-expand {
        opacity: 0;
    }

    .custom-select-sm {
        height: calc(1.8125rem + 2px);
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
        font-size: 75%;
    }

    .custom-file {
        position: relative;
        display: inline-block;
        max-width: 100%;
        height: calc(2.25rem + 2px);
        margin-bottom: 0;
    }

    .custom-file-input {
        min-width: 14rem;
        max-width: 100%;
        height: calc(2.25rem + 2px);
        margin: 0;
        opacity: 0;
    }

    .custom-file-input:focus ~ .custom-file-control {
        box-shadow: 0 0 0 0.075rem #ffffff, 0 0 0 0.2rem #745af2;
    }

    .custom-file-control {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        z-index: 5;
        height: calc(2.25rem + 2px);
        padding: 0.375rem 0.75rem;
        line-height: 1.5;
        color: #495057;
        pointer-events: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
    }

    .custom-file-control:lang(en):empty::after {
        content: "Choose file...";
    }

    .custom-file-control::before {
        position: absolute;
        top: -1px;
        right: -1px;
        bottom: -1px;
        z-index: 6;
        display: block;
        height: calc(2.25rem + 2px);
        padding: 0.375rem 0.75rem;
        line-height: 1.5;
        color: #495057;
        background-color: #e9ecef;
        border: 1px solid #ced4da;
        border-radius: 0 0.25rem 0.25rem 0;
    }

    .custom-file-control:lang(en)::before {
        content: "Browse";
    }

    .nav {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
    }

    .nav-link {
        display: block;
        padding: 0.5rem 1rem;
    }

    .nav-link:focus, .nav-link:hover {
        text-decoration: none;
    }

    .nav-link.disabled {
        color: #868e96;
    }

    .nav-tabs {
        border-bottom: 1px solid #ddd;
    }

    .nav-tabs .nav-item {
        margin-bottom: -1px;
    }

    .nav-tabs .nav-link {
        border: 1px solid transparent;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }

    .nav-tabs .nav-link:focus, .nav-tabs .nav-link:hover {
        border-color: #e9ecef #e9ecef #ddd;
    }

    .nav-tabs .nav-link.disabled {
        color: #868e96;
        background-color: transparent;
        border-color: transparent;
    }

    .nav-tabs .nav-link.active,
    .nav-tabs .nav-item.show .nav-link {
        color: #495057;
        background-color: #ffffff;
        border-color: #ddd #ddd #ffffff;
    }

    .nav-tabs .dropdown-menu {
        margin-top: -1px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .nav-pills .nav-link {
        border-radius: 0.25rem;
    }

    .nav-pills .nav-link.active,
    .nav-pills .show > .nav-link {
        color: #ffffff;
        background-color: #745af2;
    }

    .nav-fill .nav-item {
        -webkit-box-flex: 1;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        text-align: center;
    }

    .nav-justified .nav-item {
        -ms-flex-preferred-size: 0;
        flex-basis: 0;
        -webkit-box-flex: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        text-align: center;
    }

    .tab-content > .tab-pane {
        display: none;
    }

    .tab-content > .active {
        display: block;
    }

    .navbar {
        position: relative;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 0.5rem 1rem;
    }

    .navbar > .container,
    .navbar > .container-fluid {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
    }

    .navbar-brand {
        display: inline-block;
        padding-top: 0.3125rem;
        padding-bottom: 0.3125rem;
        margin-right: 1rem;
        font-size: 1.25rem;
        line-height: inherit;
        white-space: nowrap;
    }

    .navbar-brand:focus, .navbar-brand:hover {
        text-decoration: none;
    }

    .navbar-nav {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
    }

    .navbar-nav .nav-link {
        padding-right: 0;
        padding-left: 0;
    }

    .navbar-nav .dropdown-menu {
        position: static;
        float: none;
    }

    .navbar-text {
        display: inline-block;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }

    .navbar-collapse {
        -ms-flex-preferred-size: 100%;
        flex-basis: 100%;
        -webkit-box-flex: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
    }

    .navbar-toggler {
        padding: 0.25rem 0.75rem;
        font-size: 1.25rem;
        line-height: 1;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 0.25rem;
    }

    .navbar-toggler:focus, .navbar-toggler:hover {
        text-decoration: none;
    }

    .navbar-toggler-icon {
        display: inline-block;
        width: 1.5em;
        height: 1.5em;
        vertical-align: middle;
        content: "";
        background: no-repeat center center;
        background-size: 100% 100%;
    }

    @media (max-width: 575px) {
        .navbar-expand-sm > .container,
        .navbar-expand-sm > .container-fluid {
            padding-right: 0;
            padding-left: 0;
        }
    }

    @media (min-width: 576px) {
        .navbar-expand-sm {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row nowrap;
            flex-flow: row nowrap;
            -webkit-box-pack: start;
            -ms-flex-pack: start;
            justify-content: flex-start;
        }

        .navbar-expand-sm .navbar-nav {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        }

        .navbar-expand-sm .navbar-nav .dropdown-menu {
            position: absolute;
        }

        .navbar-expand-sm .navbar-nav .dropdown-menu-right {
            right: 0;
            left: auto;
        }

        .navbar-expand-sm .navbar-nav .nav-link {
            padding-right: .5rem;
            padding-left: .5rem;
        }

        .navbar-expand-sm > .container,
        .navbar-expand-sm > .container-fluid {
            -ms-flex-wrap: nowrap;
            flex-wrap: nowrap;
        }

        .navbar-expand-sm .navbar-collapse {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
            -ms-flex-preferred-size: auto;
            flex-basis: auto;
        }

        .navbar-expand-sm .navbar-toggler {
            display: none;
        }

        .navbar-expand-sm .dropup .dropdown-menu {
            top: auto;
            bottom: 100%;
        }
    }

    @media (max-width: 767px) {
        .navbar-expand-md > .container,
        .navbar-expand-md > .container-fluid {
            padding-right: 0;
            padding-left: 0;
        }
    }

    @media (min-width: 768px) {
        .navbar-expand-md {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row nowrap;
            flex-flow: row nowrap;
            -webkit-box-pack: start;
            -ms-flex-pack: start;
            justify-content: flex-start;
        }

        .navbar-expand-md .navbar-nav {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        }

        .navbar-expand-md .navbar-nav .dropdown-menu {
            position: absolute;
        }

        .navbar-expand-md .navbar-nav .dropdown-menu-right {
            right: 0;
            left: auto;
        }

        .navbar-expand-md .navbar-nav .nav-link {
            padding-right: .5rem;
            padding-left: .5rem;
        }

        .navbar-expand-md > .container,
        .navbar-expand-md > .container-fluid {
            -ms-flex-wrap: nowrap;
            flex-wrap: nowrap;
        }

        .navbar-expand-md .navbar-collapse {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
            -ms-flex-preferred-size: auto;
            flex-basis: auto;
        }

        .navbar-expand-md .navbar-toggler {
            display: none;
        }

        .navbar-expand-md .dropup .dropdown-menu {
            top: auto;
            bottom: 100%;
        }
    }

    @media (max-width: 991px) {
        .navbar-expand-lg > .container,
        .navbar-expand-lg > .container-fluid {
            padding-right: 0;
            padding-left: 0;
        }
    }

    @media (min-width: 992px) {
        .navbar-expand-lg {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row nowrap;
            flex-flow: row nowrap;
            -webkit-box-pack: start;
            -ms-flex-pack: start;
            justify-content: flex-start;
        }

        .navbar-expand-lg .navbar-nav {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        }

        .navbar-expand-lg .navbar-nav .dropdown-menu {
            position: absolute;
        }

        .navbar-expand-lg .navbar-nav .dropdown-menu-right {
            right: 0;
            left: auto;
        }

        .navbar-expand-lg .navbar-nav .nav-link {
            padding-right: .5rem;
            padding-left: .5rem;
        }

        .navbar-expand-lg > .container,
        .navbar-expand-lg > .container-fluid {
            -ms-flex-wrap: nowrap;
            flex-wrap: nowrap;
        }

        .navbar-expand-lg .navbar-collapse {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
            -ms-flex-preferred-size: auto;
            flex-basis: auto;
        }

        .navbar-expand-lg .navbar-toggler {
            display: none;
        }

        .navbar-expand-lg .dropup .dropdown-menu {
            top: auto;
            bottom: 100%;
        }
    }

    @media (max-width: 1199px) {
        .navbar-expand-xl > .container,
        .navbar-expand-xl > .container-fluid {
            padding-right: 0;
            padding-left: 0;
        }
    }

    @media (min-width: 1200px) {
        .navbar-expand-xl {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row nowrap;
            flex-flow: row nowrap;
            -webkit-box-pack: start;
            -ms-flex-pack: start;
            justify-content: flex-start;
        }

        .navbar-expand-xl .navbar-nav {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        }

        .navbar-expand-xl .navbar-nav .dropdown-menu {
            position: absolute;
        }

        .navbar-expand-xl .navbar-nav .dropdown-menu-right {
            right: 0;
            left: auto;
        }

        .navbar-expand-xl .navbar-nav .nav-link {
            padding-right: .5rem;
            padding-left: .5rem;
        }

        .navbar-expand-xl > .container,
        .navbar-expand-xl > .container-fluid {
            -ms-flex-wrap: nowrap;
            flex-wrap: nowrap;
        }

        .navbar-expand-xl .navbar-collapse {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
            -ms-flex-preferred-size: auto;
            flex-basis: auto;
        }

        .navbar-expand-xl .navbar-toggler {
            display: none;
        }

        .navbar-expand-xl .dropup .dropdown-menu {
            top: auto;
            bottom: 100%;
        }
    }

    .navbar-expand {
        -webkit-box-orient: horizontal;
        -webkit-box-direction: normal;
        -ms-flex-flow: row nowrap;
        flex-flow: row nowrap;
        -webkit-box-pack: start;
        -ms-flex-pack: start;
        justify-content: flex-start;
    }

    .navbar-expand > .container,
    .navbar-expand > .container-fluid {
        padding-right: 0;
        padding-left: 0;
    }

    .navbar-expand .navbar-nav {
        -webkit-box-orient: horizontal;
        -webkit-box-direction: normal;
        -ms-flex-direction: row;
        flex-direction: row;
    }

    .navbar-expand .navbar-nav .dropdown-menu {
        position: absolute;
    }

    .navbar-expand .navbar-nav .dropdown-menu-right {
        right: 0;
        left: auto;
    }

    .navbar-expand .navbar-nav .nav-link {
        padding-right: .5rem;
        padding-left: .5rem;
    }

    .navbar-expand > .container,
    .navbar-expand > .container-fluid {
        -ms-flex-wrap: nowrap;
        flex-wrap: nowrap;
    }

    .navbar-expand .navbar-collapse {
        display: -webkit-box !important;
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-preferred-size: auto;
        flex-basis: auto;
    }

    .navbar-expand .navbar-toggler {
        display: none;
    }

    .navbar-expand .dropup .dropdown-menu {
        top: auto;
        bottom: 100%;
    }

    .navbar-light .navbar-brand {
        color: rgba(0, 0, 0, 0.9);
    }

    .navbar-light .navbar-brand:focus, .navbar-light .navbar-brand:hover {
        color: rgba(0, 0, 0, 0.9);
    }

    .navbar-light .navbar-nav .nav-link {
        color: rgba(0, 0, 0, 0.5);
    }

    .navbar-light .navbar-nav .nav-link:focus, .navbar-light .navbar-nav .nav-link:hover {
        color: rgba(0, 0, 0, 0.7);
    }

    .navbar-light .navbar-nav .nav-link.disabled {
        color: rgba(0, 0, 0, 0.3);
    }

    .navbar-light .navbar-nav .show > .nav-link,
    .navbar-light .navbar-nav .active > .nav-link,
    .navbar-light .navbar-nav .nav-link.show,
    .navbar-light .navbar-nav .nav-link.active {
        color: rgba(0, 0, 0, 0.9);
    }

    .navbar-light .navbar-toggler {
        color: rgba(0, 0, 0, 0.5);
        border-color: rgba(0, 0, 0, 0.1);
    }

    .navbar-light .navbar-toggler-icon {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(0, 0, 0, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
    }

    .navbar-light .navbar-text {
        color: rgba(0, 0, 0, 0.5);
    }

    .navbar-light .navbar-text a {
        color: rgba(0, 0, 0, 0.9);
    }

    .navbar-light .navbar-text a:focus, .navbar-light .navbar-text a:hover {
        color: rgba(0, 0, 0, 0.9);
    }

    .navbar-dark .navbar-brand {
        color: #ffffff;
    }

    .navbar-dark .navbar-brand:focus, .navbar-dark .navbar-brand:hover {
        color: #ffffff;
    }

    .navbar-dark .navbar-nav .nav-link {
        color: rgba(255, 255, 255, 0.5);
    }

    .navbar-dark .navbar-nav .nav-link:focus, .navbar-dark .navbar-nav .nav-link:hover {
        color: rgba(255, 255, 255, 0.75);
    }

    .navbar-dark .navbar-nav .nav-link.disabled {
        color: rgba(255, 255, 255, 0.25);
    }

    .navbar-dark .navbar-nav .show > .nav-link,
    .navbar-dark .navbar-nav .active > .nav-link,
    .navbar-dark .navbar-nav .nav-link.show,
    .navbar-dark .navbar-nav .nav-link.active {
        color: #ffffff;
    }

    .navbar-dark .navbar-toggler {
        color: rgba(255, 255, 255, 0.5);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .navbar-dark .navbar-toggler-icon {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
    }

    .navbar-dark .navbar-text {
        color: rgba(255, 255, 255, 0.5);
    }

    .navbar-dark .navbar-text a {
        color: #ffffff;
    }

    .navbar-dark .navbar-text a:focus, .navbar-dark .navbar-text a:hover {
        color: #ffffff;
    }

    .card {
        position: relative;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #ffffff;
        background-clip: border-box;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-radius: 0.25rem;
    }

    .card > hr {
        margin-right: 0;
        margin-left: 0;
    }

    .card > .list-group:first-child .list-group-item:first-child {
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }

    .card > .list-group:last-child .list-group-item:last-child {
        border-bottom-right-radius: 0.25rem;
        border-bottom-left-radius: 0.25rem;
    }

    .card-body {
        -webkit-box-flex: 1;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        padding: 1.25rem;
    }

    .card-title {
        margin-bottom: 0.75rem;
    }

    .card-subtitle {
        margin-top: -0.375rem;
        margin-bottom: 0;
    }

    .card-text:last-child {
        margin-bottom: 0;
    }

    .card-link:hover {
        text-decoration: none;
    }

    .card-link + .card-link {
        margin-left: 1.25rem;
    }

    .card-header {
        padding: 0.75rem 1.25rem;
        margin-bottom: 0;
        background-color: rgba(0, 0, 0, 0.03);
        border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    }

    .card-header:first-child {
        border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
    }

    .card-header + .list-group .list-group-item:first-child {
        border-top: 0;
    }

    .card-footer {
        padding: 0.75rem 1.25rem;
        background-color: rgba(0, 0, 0, 0.03);
        border-top: 1px solid rgba(0, 0, 0, 0.125);
    }

    .card-footer:last-child {
        border-radius: 0 0 calc(0.25rem - 1px) calc(0.25rem - 1px);
    }

    .card-header-tabs {
        margin-right: -0.625rem;
        margin-bottom: -0.75rem;
        margin-left: -0.625rem;
        border-bottom: 0;
    }

    .card-header-pills {
        margin-right: -0.625rem;
        margin-left: -0.625rem;
    }

    .card-img-overlay {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 1.25rem;
    }

    .card-img {
        width: 100%;
        border-radius: calc(0.25rem - 1px);
    }

    .card-img-top {
        width: 100%;
        border-top-left-radius: calc(0.25rem - 1px);
        border-top-right-radius: calc(0.25rem - 1px);
    }

    .card-img-bottom {
        width: 100%;
        border-bottom-right-radius: calc(0.25rem - 1px);
        border-bottom-left-radius: calc(0.25rem - 1px);
    }

    .card-deck {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
    }

    .card-deck .card {
        margin-bottom: 15px;
    }

    @media (min-width: 576px) {
        .card-deck {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row wrap;
            flex-flow: row wrap;
            margin-right: -15px;
            margin-left: -15px;
        }

        .card-deck .card {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-flex: 1;
            -ms-flex: 1 0 0%;
            flex: 1 0 0%;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            margin-right: 15px;
            margin-bottom: 0;
            margin-left: 15px;
        }
    }

    .card-group {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
    }

    .card-group .card {
        margin-bottom: 15px;
    }

    @media (min-width: 576px) {
        .card-group {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row wrap;
            flex-flow: row wrap;
        }

        .card-group .card {
            -webkit-box-flex: 1;
            -ms-flex: 1 0 0%;
            flex: 1 0 0%;
            margin-bottom: 0;
        }

        .card-group .card + .card {
            margin-left: 0;
            border-left: 0;
        }

        .card-group .card:first-child {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }

        .card-group .card:first-child .card-img-top {
            border-top-right-radius: 0;
        }

        .card-group .card:first-child .card-img-bottom {
            border-bottom-right-radius: 0;
        }

        .card-group .card:last-child {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }

        .card-group .card:last-child .card-img-top {
            border-top-left-radius: 0;
        }

        .card-group .card:last-child .card-img-bottom {
            border-bottom-left-radius: 0;
        }

        .card-group .card:only-child {
            border-radius: 0.25rem;
        }

        .card-group .card:only-child .card-img-top {
            border-top-left-radius: 0.25rem;
            border-top-right-radius: 0.25rem;
        }

        .card-group .card:only-child .card-img-bottom {
            border-bottom-right-radius: 0.25rem;
            border-bottom-left-radius: 0.25rem;
        }

        .card-group .card:not(:first-child):not(:last-child):not(:only-child) {
            border-radius: 0;
        }

        .card-group .card:not(:first-child):not(:last-child):not(:only-child) .card-img-top,
        .card-group .card:not(:first-child):not(:last-child):not(:only-child) .card-img-bottom {
            border-radius: 0;
        }
    }

    .card-columns .card {
        margin-bottom: 0.75rem;
    }

    @media (min-width: 576px) {
        .card-columns {
            -webkit-column-count: 3;
            column-count: 3;
            -webkit-column-gap: 1.25rem;
            column-gap: 1.25rem;
        }

        .card-columns .card {
            display: inline-block;
            width: 100%;
        }
    }

    .breadcrumb {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        list-style: none;
        background-color: #e9ecef;
        border-radius: 0.25rem;
    }

    .breadcrumb-item + .breadcrumb-item::before {
        display: inline-block;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        color: #868e96;
        content: "/";
    }

    .breadcrumb-item + .breadcrumb-item:hover::before {
        text-decoration: underline;
    }

    .breadcrumb-item + .breadcrumb-item:hover::before {
        text-decoration: none;
    }

    .breadcrumb-item.active {
        color: #868e96;
    }

    .pagination {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        padding-left: 0;
        list-style: none;
        border-radius: 0.25rem;
    }

    .page-item:first-child .page-link {
        margin-left: 0;
        border-top-left-radius: 0.25rem;
        border-bottom-left-radius: 0.25rem;
    }

    .page-item:last-child .page-link {
        border-top-right-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
    }

    .page-item.active .page-link {
        z-index: 2;
        color: #ffffff;
        background-color: #745af2;
        border-color: #745af2;
    }

    .page-item.disabled .page-link {
        color: #868e96;
        pointer-events: none;
        background-color: #ffffff;
        border-color: #ddd;
    }

    .page-link {
        position: relative;
        display: block;
        padding: 0.5rem 0.75rem;
        margin-left: -1px;
        line-height: 1.25;
        color: #745af2;
        background-color: #ffffff;
        border: 1px solid #ddd;
    }

    .page-link:focus, .page-link:hover {
        color: #3813ec;
        text-decoration: none;
        background-color: #e9ecef;
        border-color: #ddd;
    }

    .pagination-lg .page-link {
        padding: 0.75rem 1.5rem;
        font-size: 1.25rem;
        line-height: 1.5;
    }

    .pagination-lg .page-item:first-child .page-link {
        border-top-left-radius: 0.3rem;
        border-bottom-left-radius: 0.3rem;
    }

    .pagination-lg .page-item:last-child .page-link {
        border-top-right-radius: 0.3rem;
        border-bottom-right-radius: 0.3rem;
    }

    .pagination-sm .page-link {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
    }

    .pagination-sm .page-item:first-child .page-link {
        border-top-left-radius: 0.2rem;
        border-bottom-left-radius: 0.2rem;
    }

    .pagination-sm .page-item:last-child .page-link {
        border-top-right-radius: 0.2rem;
        border-bottom-right-radius: 0.2rem;
    }

    .badge {
        display: inline-block;
        padding: 0.25em 0.4em;
        font-size: 75%;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 0.25rem;
    }

    .badge:empty {
        display: none;
    }

    .btn .badge {
        position: relative;
        top: -1px;
    }

    .badge-pill {
        padding-right: 0.6em;
        padding-left: 0.6em;
        border-radius: 10rem;
    }

    .badge-primary {
        color: #fff;
        background-color: #745af2;
    }

    .badge-primary[href]:focus, .badge-primary[href]:hover {
        color: #fff;
        text-decoration: none;
        background-color: #4c2bee;
    }

    .badge-secondary {
        color: #111;
        background-color: #cccccc;
    }

    .badge-secondary[href]:focus, .badge-secondary[href]:hover {
        color: #111;
        text-decoration: none;
        background-color: #b3b2b2;
    }

    .badge-success {
        color: #fff;
        background-color: #06d79c;
    }

    .badge-success[href]:focus, .badge-success[href]:hover {
        color: #fff;
        text-decoration: none;
        background-color: #05a578;
    }

    .badge-info {
        color: #fff;
        background-color: #398bf7;
    }

    .badge-info[href]:focus, .badge-info[href]:hover {
        color: #fff;
        text-decoration: none;
        background-color: #0a6ff3;
    }

    .badge-warning {
        color: #111;
        background-color: #ffb22b;
    }

    .badge-warning[href]:focus, .badge-warning[href]:hover {
        color: #111;
        text-decoration: none;
        background-color: #f79d00;
    }

    .badge-danger {
        color: #fff;
        background-color: #ef5350;
    }

    .badge-danger[href]:focus, .badge-danger[href]:hover {
        color: #fff;
        text-decoration: none;
        background-color: #eb2521;
    }

    .badge-light {
        color: #111;
        background-color: #e9edf2;
    }

    .badge-light[href]:focus, .badge-light[href]:hover {
        color: #111;
        text-decoration: none;
        background-color: #c9d3df;
    }

    .badge-dark {
        color: #fff;
        background-color: #263238;
    }

    .badge-dark[href]:focus, .badge-dark[href]:hover {
        color: #fff;
        text-decoration: none;
        background-color: #11171a;
    }

    .jumbotron {
        padding: 2rem 1rem;
        margin-bottom: 2rem;
        background-color: #e9ecef;
        border-radius: 0.3rem;
    }

    @media (min-width: 576px) {
        .jumbotron {
            padding: 4rem 2rem;
        }
    }

    .jumbotron-fluid {
        padding-right: 0;
        padding-left: 0;
        border-radius: 0;
    }

    .alert {
        position: relative;
        padding: 0.75rem 1.25rem;
        margin-bottom: 1rem;
        border: 1px solid transparent;
        border-radius: 0.25rem;
    }

    .alert-heading {
        color: inherit;
    }

    .alert-link {
        font-weight: 700;
    }

    .alert-dismissible .close {
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.75rem 1.25rem;
        color: inherit;
    }

    .alert-primary {
        color: #3c2f7e;
        background-color: #e3defc;
        border-color: #d8d1fb;
    }

    .alert-primary hr {
        border-top-color: #c4baf9;
    }

    .alert-primary .alert-link {
        color: #2a2159;
    }

    .alert-secondary {
        color: #6a6a6a;
        background-color: whitesmoke;
        border-color: #f1f1f1;
    }

    .alert-secondary hr {
        border-top-color: #e4e4e4;
    }

    .alert-secondary .alert-link {
        color: #515050;
    }

    .alert-success {
        color: #037051;
        background-color: #cdf7eb;
        border-color: #b9f4e3;
    }

    .alert-success hr {
        border-top-color: #a3f1da;
    }

    .alert-success .alert-link {
        color: #023e2d;
    }

    .alert-info {
        color: #1e4880;
        background-color: #d7e8fd;
        border-color: #c8dffd;
    }

    .alert-info hr {
        border-top-color: #afd1fc;
    }

    .alert-info .alert-link {
        color: #143157;
    }

    .alert-warning {
        color: #855d16;
        background-color: #fff0d5;
        border-color: #ffe9c4;
    }

    .alert-warning hr {
        border-top-color: #ffdfab;
    }

    .alert-warning .alert-link {
        color: #593e0f;
    }

    .alert-danger {
        color: #7c2b2a;
        background-color: #fcdddc;
        border-color: #fbcfce;
    }

    .alert-danger hr {
        border-top-color: #f9b8b6;
    }

    .alert-danger .alert-link {
        color: #561e1d;
    }

    .alert-light {
        color: #797b7e;
        background-color: #fbfbfc;
        border-color: #f9fafb;
    }

    .alert-light hr {
        border-top-color: #eaedf1;
    }

    .alert-light .alert-link {
        color: #606264;
    }

    .alert-dark {
        color: #141a1d;
        background-color: #d4d6d7;
        border-color: #c2c6c7;
    }

    .alert-dark hr {
        border-top-color: #b5babb;
    }

    .alert-dark .alert-link {
        color: black;
    }

    @-webkit-keyframes progress-bar-stripes {
        from {
            background-position: 1rem 0;
        }
        to {
            background-position: 0 0;
        }
    }

    @keyframes progress-bar-stripes {
        from {
            background-position: 1rem 0;
        }
        to {
            background-position: 0 0;
        }
    }

    .progress {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        height: 1rem;
        overflow: hidden;
        font-size: 0.75rem;
        background-color: #e9ecef;
        border-radius: 0.25rem;
    }

    .progress-bar {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        color: #ffffff;
        background-color: #745af2;
    }

    .progress-bar-striped {
        background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
        background-size: 1rem 1rem;
    }

    .progress-bar-animated {
        -webkit-animation: progress-bar-stripes 1s linear infinite;
        animation: progress-bar-stripes 1s linear infinite;
    }

    .media {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: start;
        -ms-flex-align: start;
        align-items: flex-start;
    }

    .media-body {
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
    }

    .list-group {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        padding-left: 0;
        margin-bottom: 0;
    }

    .list-group-item-action {
        width: 100%;
        color: #495057;
        text-align: inherit;
    }

    .list-group-item-action:focus, .list-group-item-action:hover {
        color: #495057;
        text-decoration: none;
        background-color: #f8f9fa;
    }

    .list-group-item-action:active {
        color: #212529;
        background-color: #e9ecef;
    }

    .list-group-item {
        position: relative;
        display: block;
        padding: 0.75rem 1.25rem;
        margin-bottom: -1px;
        background-color: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.125);
    }

    .list-group-item:first-child {
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }

    .list-group-item:last-child {
        margin-bottom: 0;
        border-bottom-right-radius: 0.25rem;
        border-bottom-left-radius: 0.25rem;
    }

    .list-group-item:focus, .list-group-item:hover {
        text-decoration: none;
    }

    .list-group-item.disabled, .list-group-item:disabled {
        color: #868e96;
        background-color: #ffffff;
    }

    .list-group-item.active {
        z-index: 2;
        color: #ffffff;
        background-color: #745af2;
        border-color: #745af2;
    }

    .list-group-flush .list-group-item {
        border-right: 0;
        border-left: 0;
        border-radius: 0;
    }

    .list-group-flush:first-child .list-group-item:first-child {
        border-top: 0;
    }

    .list-group-flush:last-child .list-group-item:last-child {
        border-bottom: 0;
    }

    .list-group-item-primary {
        color: #3c2f7e;
        background-color: #d8d1fb;
    }

    a.list-group-item-primary,
    button.list-group-item-primary {
        color: #3c2f7e;
    }

    a.list-group-item-primary:focus, a.list-group-item-primary:hover,
    button.list-group-item-primary:focus,
    button.list-group-item-primary:hover {
        color: #3c2f7e;
        background-color: #c4baf9;
    }

    a.list-group-item-primary.active,
    button.list-group-item-primary.active {
        color: #fff;
        background-color: #3c2f7e;
        border-color: #3c2f7e;
    }

    .list-group-item-secondary {
        color: #6a6a6a;
        background-color: #f1f1f1;
    }

    a.list-group-item-secondary,
    button.list-group-item-secondary {
        color: #6a6a6a;
    }

    a.list-group-item-secondary:focus, a.list-group-item-secondary:hover,
    button.list-group-item-secondary:focus,
    button.list-group-item-secondary:hover {
        color: #6a6a6a;
        background-color: #e4e4e4;
    }

    a.list-group-item-secondary.active,
    button.list-group-item-secondary.active {
        color: #fff;
        background-color: #6a6a6a;
        border-color: #6a6a6a;
    }

    .list-group-item-success {
        color: #037051;
        background-color: #b9f4e3;
    }

    a.list-group-item-success,
    button.list-group-item-success {
        color: #037051;
    }

    a.list-group-item-success:focus, a.list-group-item-success:hover,
    button.list-group-item-success:focus,
    button.list-group-item-success:hover {
        color: #037051;
        background-color: #a3f1da;
    }

    a.list-group-item-success.active,
    button.list-group-item-success.active {
        color: #fff;
        background-color: #037051;
        border-color: #037051;
    }

    .list-group-item-info {
        color: #1e4880;
        background-color: #c8dffd;
    }

    a.list-group-item-info,
    button.list-group-item-info {
        color: #1e4880;
    }

    a.list-group-item-info:focus, a.list-group-item-info:hover,
    button.list-group-item-info:focus,
    button.list-group-item-info:hover {
        color: #1e4880;
        background-color: #afd1fc;
    }

    a.list-group-item-info.active,
    button.list-group-item-info.active {
        color: #fff;
        background-color: #1e4880;
        border-color: #1e4880;
    }

    .list-group-item-warning {
        color: #855d16;
        background-color: #ffe9c4;
    }

    a.list-group-item-warning,
    button.list-group-item-warning {
        color: #855d16;
    }

    a.list-group-item-warning:focus, a.list-group-item-warning:hover,
    button.list-group-item-warning:focus,
    button.list-group-item-warning:hover {
        color: #855d16;
        background-color: #ffdfab;
    }

    a.list-group-item-warning.active,
    button.list-group-item-warning.active {
        color: #fff;
        background-color: #855d16;
        border-color: #855d16;
    }

    .list-group-item-danger {
        color: #7c2b2a;
        background-color: #fbcfce;
    }

    a.list-group-item-danger,
    button.list-group-item-danger {
        color: #7c2b2a;
    }

    a.list-group-item-danger:focus, a.list-group-item-danger:hover,
    button.list-group-item-danger:focus,
    button.list-group-item-danger:hover {
        color: #7c2b2a;
        background-color: #f9b8b6;
    }

    a.list-group-item-danger.active,
    button.list-group-item-danger.active {
        color: #fff;
        background-color: #7c2b2a;
        border-color: #7c2b2a;
    }

    .list-group-item-light {
        color: #797b7e;
        background-color: #f9fafb;
    }

    a.list-group-item-light,
    button.list-group-item-light {
        color: #797b7e;
    }

    a.list-group-item-light:focus, a.list-group-item-light:hover,
    button.list-group-item-light:focus,
    button.list-group-item-light:hover {
        color: #797b7e;
        background-color: #eaedf1;
    }

    a.list-group-item-light.active,
    button.list-group-item-light.active {
        color: #fff;
        background-color: #797b7e;
        border-color: #797b7e;
    }

    .list-group-item-dark {
        color: #141a1d;
        background-color: #c2c6c7;
    }

    a.list-group-item-dark,
    button.list-group-item-dark {
        color: #141a1d;
    }

    a.list-group-item-dark:focus, a.list-group-item-dark:hover,
    button.list-group-item-dark:focus,
    button.list-group-item-dark:hover {
        color: #141a1d;
        background-color: #b5babb;
    }

    a.list-group-item-dark.active,
    button.list-group-item-dark.active {
        color: #fff;
        background-color: #141a1d;
        border-color: #141a1d;
    }

    .close {
        float: right;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #ffffff;
        opacity: .5;
    }

    .close:focus, .close:hover {
        color: #000;
        text-decoration: none;
        opacity: .75;
    }

    button.close {
        padding: 0;
        background: transparent;
        border: 0;
        -webkit-appearance: none;
    }

    .modal-open {
        overflow: hidden;
    }

    .modal {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1050;
        display: none;
        overflow: hidden;
        outline: 0;
    }

    .modal.fade .modal-dialog {
        transition: -webkit-transform 0.3s ease-out;
        transition: transform 0.3s ease-out;
        transition: transform 0.3s ease-out, -webkit-transform 0.3s ease-out;
        -webkit-transform: translate(0, -25%);
        transform: translate(0, -25%);
    }

    .modal.show .modal-dialog {
        -webkit-transform: translate(0, 0);
        transform: translate(0, 0);
    }

    .modal-open .modal {
        overflow-x: hidden;
        overflow-y: auto;
    }

    .modal-dialog {
        position: relative;
        width: auto;
        margin: 10px;
        pointer-events: none;
    }

    .modal-content {
        position: relative;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        pointer-events: auto;
        background-color: #ffffff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 0.3rem;
        outline: 0;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1040;
        background-color: #000;
    }

    .modal-backdrop.fade {
        opacity: 0;
    }

    .modal-backdrop.show {
        opacity: 0.5;
    }

    .modal-header {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: start;
        -ms-flex-align: start;
        align-items: flex-start;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 15px;
        border-bottom: 1px solid #e9ecef;
        border-top-left-radius: 0.3rem;
        border-top-right-radius: 0.3rem;
    }

    .modal-header .close {
        padding: 15px;
        margin: -15px -15px -15px auto;
    }

    .modal-title {
        margin-bottom: 0;
        line-height: 1.5;
    }

    .modal-body {
        position: relative;
        -webkit-box-flex: 1;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;
        padding: 15px;
    }

    .modal-footer {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: end;
        -ms-flex-pack: end;
        justify-content: flex-end;
        padding: 15px;
        border-top: 1px solid #e9ecef;
    }

    .modal-footer > :not(:first-child) {
        margin-left: .25rem;
    }

    .modal-footer > :not(:last-child) {
        margin-right: .25rem;
    }

    .modal-scrollbar-measure {
        position: absolute;
        top: -9999px;
        width: 50px;
        height: 50px;
        overflow: scroll;
    }

    @media (min-width: 576px) {
        .modal-dialog {
            max-width: 500px;
            margin: 30px auto;
        }

        .modal-sm {
            max-width: 300px;
        }
    }

    @media (min-width: 992px) {
        .modal-lg {
            max-width: 800px;
        }
    }

    .tooltip {
        position: absolute;
        z-index: 1070;
        display: block;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-style: normal;
        font-weight: 400;
        line-height: 1.5;
        text-align: left;
        text-align: start;
        text-decoration: none;
        text-shadow: none;
        text-transform: none;
        letter-spacing: normal;
        word-break: normal;
        word-spacing: normal;
        white-space: normal;
        line-break: auto;
        font-size: 0.875rem;
        word-wrap: break-word;
        opacity: 0;
    }

    .tooltip.show {
        opacity: 0.9;
    }

    .tooltip .arrow {
        position: absolute;
        display: block;
        width: 5px;
        height: 5px;
    }

    .tooltip .arrow::before {
        position: absolute;
        border-color: transparent;
        border-style: solid;
    }

    .tooltip.bs-tooltip-top, .tooltip.bs-tooltip-auto[x-placement^="top"] {
        padding: 5px 0;
    }

    .tooltip.bs-tooltip-top .arrow, .tooltip.bs-tooltip-auto[x-placement^="top"] .arrow {
        bottom: 0;
    }

    .tooltip.bs-tooltip-top .arrow::before, .tooltip.bs-tooltip-auto[x-placement^="top"] .arrow::before {
        margin-left: -3px;
        content: "";
        border-width: 5px 5px 0;
        border-top-color: #000;
    }

    .tooltip.bs-tooltip-right, .tooltip.bs-tooltip-auto[x-placement^="right"] {
        padding: 0 5px;
    }

    .tooltip.bs-tooltip-right .arrow, .tooltip.bs-tooltip-auto[x-placement^="right"] .arrow {
        left: 0;
    }

    .tooltip.bs-tooltip-right .arrow::before, .tooltip.bs-tooltip-auto[x-placement^="right"] .arrow::before {
        margin-top: -3px;
        content: "";
        border-width: 5px 5px 5px 0;
        border-right-color: #000;
    }

    .tooltip.bs-tooltip-bottom, .tooltip.bs-tooltip-auto[x-placement^="bottom"] {
        padding: 5px 0;
    }

    .tooltip.bs-tooltip-bottom .arrow, .tooltip.bs-tooltip-auto[x-placement^="bottom"] .arrow {
        top: 0;
    }

    .tooltip.bs-tooltip-bottom .arrow::before, .tooltip.bs-tooltip-auto[x-placement^="bottom"] .arrow::before {
        margin-left: -3px;
        content: "";
        border-width: 0 5px 5px;
        border-bottom-color: #000;
    }

    .tooltip.bs-tooltip-left, .tooltip.bs-tooltip-auto[x-placement^="left"] {
        padding: 0 5px;
    }

    .tooltip.bs-tooltip-left .arrow, .tooltip.bs-tooltip-auto[x-placement^="left"] .arrow {
        right: 0;
    }

    .tooltip.bs-tooltip-left .arrow::before, .tooltip.bs-tooltip-auto[x-placement^="left"] .arrow::before {
        right: 0;
        margin-top: -3px;
        content: "";
        border-width: 5px 0 5px 5px;
        border-left-color: #000;
    }

    .tooltip-inner {
        max-width: 200px;
        padding: 3px 8px;
        color: #ffffff;
        text-align: center;
        background-color: #000;
        border-radius: 0.25rem;
    }

    .popover {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1060;
        display: block;
        max-width: 276px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-style: normal;
        font-weight: 400;
        line-height: 1.5;
        text-align: left;
        text-align: start;
        text-decoration: none;
        text-shadow: none;
        text-transform: none;
        letter-spacing: normal;
        word-break: normal;
        word-spacing: normal;
        white-space: normal;
        line-break: auto;
        font-size: 0.875rem;
        word-wrap: break-word;
        background-color: #ffffff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 0.3rem;
    }

    .popover .arrow {
        position: absolute;
        display: block;
        width: 0.8rem;
        height: 0.4rem;
    }

    .popover .arrow::before,
    .popover .arrow::after {
        position: absolute;
        display: block;
        border-color: transparent;
        border-style: solid;
    }

    .popover .arrow::before {
        content: "";
        border-width: 0.8rem;
    }

    .popover .arrow::after {
        content: "";
        border-width: 0.8rem;
    }

    .popover.bs-popover-top, .popover.bs-popover-auto[x-placement^="top"] {
        margin-bottom: 0.8rem;
    }

    .popover.bs-popover-top .arrow, .popover.bs-popover-auto[x-placement^="top"] .arrow {
        bottom: 0;
    }

    .popover.bs-popover-top .arrow::before, .popover.bs-popover-auto[x-placement^="top"] .arrow::before,
    .popover.bs-popover-top .arrow::after, .popover.bs-popover-auto[x-placement^="top"] .arrow::after {
        border-bottom-width: 0;
    }

    .popover.bs-popover-top .arrow::before, .popover.bs-popover-auto[x-placement^="top"] .arrow::before {
        bottom: -0.8rem;
        margin-left: -0.8rem;
        border-top-color: rgba(0, 0, 0, 0.25);
    }

    .popover.bs-popover-top .arrow::after, .popover.bs-popover-auto[x-placement^="top"] .arrow::after {
        bottom: calc((0.8rem - 1px) * -1);
        margin-left: -0.8rem;
        border-top-color: #ffffff;
    }

    .popover.bs-popover-right, .popover.bs-popover-auto[x-placement^="right"] {
        margin-left: 0.8rem;
    }

    .popover.bs-popover-right .arrow, .popover.bs-popover-auto[x-placement^="right"] .arrow {
        left: 0;
    }

    .popover.bs-popover-right .arrow::before, .popover.bs-popover-auto[x-placement^="right"] .arrow::before,
    .popover.bs-popover-right .arrow::after, .popover.bs-popover-auto[x-placement^="right"] .arrow::after {
        margin-top: -0.8rem;
        border-left-width: 0;
    }

    .popover.bs-popover-right .arrow::before, .popover.bs-popover-auto[x-placement^="right"] .arrow::before {
        left: -0.8rem;
        border-right-color: rgba(0, 0, 0, 0.25);
    }

    .popover.bs-popover-right .arrow::after, .popover.bs-popover-auto[x-placement^="right"] .arrow::after {
        left: calc((0.8rem - 1px) * -1);
        border-right-color: #ffffff;
    }

    .popover.bs-popover-bottom, .popover.bs-popover-auto[x-placement^="bottom"] {
        margin-top: 0.8rem;
    }

    .popover.bs-popover-bottom .arrow, .popover.bs-popover-auto[x-placement^="bottom"] .arrow {
        top: 0;
    }

    .popover.bs-popover-bottom .arrow::before, .popover.bs-popover-auto[x-placement^="bottom"] .arrow::before,
    .popover.bs-popover-bottom .arrow::after, .popover.bs-popover-auto[x-placement^="bottom"] .arrow::after {
        margin-left: -0.8rem;
        border-top-width: 0;
    }

    .popover.bs-popover-bottom .arrow::before, .popover.bs-popover-auto[x-placement^="bottom"] .arrow::before {
        top: -0.8rem;
        border-bottom-color: rgba(0, 0, 0, 0.25);
    }

    .popover.bs-popover-bottom .arrow::after, .popover.bs-popover-auto[x-placement^="bottom"] .arrow::after {
        top: calc((0.8rem - 1px) * -1);
        border-bottom-color: #ffffff;
    }

    .popover.bs-popover-bottom .popover-header::before, .popover.bs-popover-auto[x-placement^="bottom"] .popover-header::before {
        position: absolute;
        top: 0;
        left: 50%;
        display: block;
        width: 20px;
        margin-left: -10px;
        content: "";
        border-bottom: 1px solid #f7f7f7;
    }

    .popover.bs-popover-left, .popover.bs-popover-auto[x-placement^="left"] {
        margin-right: 0.8rem;
    }

    .popover.bs-popover-left .arrow, .popover.bs-popover-auto[x-placement^="left"] .arrow {
        right: 0;
    }

    .popover.bs-popover-left .arrow::before, .popover.bs-popover-auto[x-placement^="left"] .arrow::before,
    .popover.bs-popover-left .arrow::after, .popover.bs-popover-auto[x-placement^="left"] .arrow::after {
        margin-top: -0.8rem;
        border-right-width: 0;
    }

    .popover.bs-popover-left .arrow::before, .popover.bs-popover-auto[x-placement^="left"] .arrow::before {
        right: -0.8rem;
        border-left-color: rgba(0, 0, 0, 0.25);
    }

    .popover.bs-popover-left .arrow::after, .popover.bs-popover-auto[x-placement^="left"] .arrow::after {
        right: calc((0.8rem - 1px) * -1);
        border-left-color: #ffffff;
    }

    .popover-header {
        padding: 0.5rem 0.75rem;
        margin-bottom: 0;
        font-size: 1rem;
        color: inherit;
        background-color: #f7f7f7;
        border-bottom: 1px solid #ebebeb;
        border-top-left-radius: calc(0.3rem - 1px);
        border-top-right-radius: calc(0.3rem - 1px);
    }

    .popover-header:empty {
        display: none;
    }

    .popover-body {
        padding: 0.5rem 0.75rem;
        color: #212529;
    }

    .carousel {
        position: relative;
    }

    .carousel-inner {
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .carousel-item {
        position: relative;
        display: none;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        width: 100%;
        transition: -webkit-transform 0.6s ease;
        transition: transform 0.6s ease;
        transition: transform 0.6s ease, -webkit-transform 0.6s ease;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000px;
        perspective: 1000px;
    }

    .carousel-item.active,
    .carousel-item-next,
    .carousel-item-prev {
        display: block;
    }

    .carousel-item-next,
    .carousel-item-prev {
        position: absolute;
        top: 0;
    }

    .carousel-item-next.carousel-item-left,
    .carousel-item-prev.carousel-item-right {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }

    @supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {
        .carousel-item-next.carousel-item-left,
        .carousel-item-prev.carousel-item-right {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
        }
    }

    .carousel-item-next,
    .active.carousel-item-right {
        -webkit-transform: translateX(100%);
        transform: translateX(100%);
    }

    @supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {
        .carousel-item-next,
        .active.carousel-item-right {
            -webkit-transform: translate3d(100%, 0, 0);
            transform: translate3d(100%, 0, 0);
        }
    }

    .carousel-item-prev,
    .active.carousel-item-left {
        -webkit-transform: translateX(-100%);
        transform: translateX(-100%);
    }

    @supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {
        .carousel-item-prev,
        .active.carousel-item-left {
            -webkit-transform: translate3d(-100%, 0, 0);
            transform: translate3d(-100%, 0, 0);
        }
    }

    .carousel-control-prev,
    .carousel-control-next {
        position: absolute;
        top: 0;
        bottom: 0;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        width: 15%;
        color: #ffffff;
        text-align: center;
        opacity: 0.5;
    }

    .carousel-control-prev:focus, .carousel-control-prev:hover,
    .carousel-control-next:focus,
    .carousel-control-next:hover {
        color: #ffffff;
        text-decoration: none;
        outline: 0;
        opacity: .9;
    }

    .carousel-control-prev {
        left: 0;
    }

    .carousel-control-next {
        right: 0;
    }

    .carousel-control-prev-icon,
    .carousel-control-next-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: transparent no-repeat center center;
        background-size: 100% 100%;
    }

    .carousel-control-prev-icon {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 8 8'%3E%3Cpath d='M5.25 0l-4 4 4 4 1.5-1.5-2.5-2.5 2.5-2.5-1.5-1.5z'/%3E%3C/svg%3E");
    }

    .carousel-control-next-icon {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 8 8'%3E%3Cpath d='M2.75 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z'/%3E%3C/svg%3E");
    }

    .carousel-indicators {
        position: absolute;
        right: 0;
        bottom: 10px;
        left: 0;
        z-index: 15;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        padding-left: 0;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    }

    .carousel-indicators li {
        position: relative;
        -webkit-box-flex: 0;
        -ms-flex: 0 1 auto;
        flex: 0 1 auto;
        width: 30px;
        height: 3px;
        margin-right: 3px;
        margin-left: 3px;
        text-indent: -999px;
        background-color: rgba(255, 255, 255, 0.5);
    }

    .carousel-indicators li::before {
        position: absolute;
        top: -10px;
        left: 0;
        display: inline-block;
        width: 100%;
        height: 10px;
        content: "";
    }

    .carousel-indicators li::after {
        position: absolute;
        bottom: -10px;
        left: 0;
        display: inline-block;
        width: 100%;
        height: 10px;
        content: "";
    }

    .carousel-indicators .active {
        background-color: #ffffff;
    }

    .carousel-caption {
        position: absolute;
        right: 15%;
        bottom: 20px;
        left: 15%;
        z-index: 10;
        padding-top: 20px;
        padding-bottom: 20px;
        color: #ffffff;
        text-align: center;
    }

    .align-baseline {
        vertical-align: baseline !important;
    }

    .align-top {
        vertical-align: top !important;
    }

    .align-middle {
        vertical-align: middle !important;
    }

    .align-bottom {
        vertical-align: bottom !important;
    }

    .align-text-bottom {
        vertical-align: text-bottom !important;
    }

    .align-text-top {
        vertical-align: text-top !important;
    }

    .bg-primary {
        background-color: #745af2 !important;
    }

    a.bg-primary:focus, a.bg-primary:hover {
        background-color: #4c2bee !important;
    }

    .bg-secondary {
        background-color: #cccccc !important;
    }

    a.bg-secondary:focus, a.bg-secondary:hover {
        background-color: #b3b2b2 !important;
    }

    .bg-success {
        background-color: #06d79c !important;
    }

    a.bg-success:focus, a.bg-success:hover {
        background-color: #05a578 !important;
    }

    .bg-info {
        background-color: #398bf7 !important;
    }

    a.bg-info:focus, a.bg-info:hover {
        background-color: #0a6ff3 !important;
    }

    .bg-warning {
        background-color: #ffb22b !important;
    }

    a.bg-warning:focus, a.bg-warning:hover {
        background-color: #f79d00 !important;
    }

    .bg-danger {
        background-color: #ef5350 !important;
    }

    a.bg-danger:focus, a.bg-danger:hover {
        background-color: #eb2521 !important;
    }

    .bg-light {
        background-color: #e9edf2 !important;
    }

    a.bg-light:focus, a.bg-light:hover {
        background-color: #c9d3df !important;
    }

    .bg-dark {
        background-color: #263238 !important;
    }

    a.bg-dark:focus, a.bg-dark:hover {
        background-color: #11171a !important;
    }

    .bg-white {
        background-color: #ffffff !important;
    }

    .bg-transparent {
        background-color: transparent !important;
    }

    .border {
        border: 1px solid #e9ecef !important;
    }

    .border-0 {
        border: 0 !important;
    }

    .border-top-0 {
        border-top: 0 !important;
    }

    .border-right-0 {
        border-right: 0 !important;
    }

    .border-bottom-0 {
        border-bottom: 0 !important;
    }

    .border-left-0 {
        border-left: 0 !important;
    }

    .border-primary {
        border-color: #745af2 !important;
    }

    .border-secondary {
        border-color: #cccccc !important;
    }

    .border-success {
        border-color: #06d79c !important;
    }

    .border-info {
        border-color: #398bf7 !important;
    }

    .border-warning {
        border-color: #ffb22b !important;
    }

    .border-danger {
        border-color: #ef5350 !important;
    }

    .border-light {
        border-color: #e9edf2 !important;
    }

    .border-dark {
        border-color: #263238 !important;
    }

    .border-white {
        border-color: #ffffff !important;
    }

    .rounded {
        border-radius: 0.25rem !important;
    }

    .rounded-top {
        border-top-left-radius: 0.25rem !important;
        border-top-right-radius: 0.25rem !important;
    }

    .rounded-right {
        border-top-right-radius: 0.25rem !important;
        border-bottom-right-radius: 0.25rem !important;
    }

    .rounded-bottom {
        border-bottom-right-radius: 0.25rem !important;
        border-bottom-left-radius: 0.25rem !important;
    }

    .rounded-left {
        border-top-left-radius: 0.25rem !important;
        border-bottom-left-radius: 0.25rem !important;
    }

    .rounded-circle {
        border-radius: 50% !important;
    }

    .rounded-0 {
        border-radius: 0 !important;
    }

    .clearfix::after {
        display: block;
        clear: both;
        content: "";
    }

    .d-none {
        display: none !important;
    }

    .d-inline {
        display: inline !important;
    }

    .d-inline-block {
        display: inline-block !important;
    }

    .d-block {
        display: block !important;
    }

    .d-table {
        display: table !important;
    }

    .d-table-row {
        display: table-row !important;
    }

    .d-table-cell {
        display: table-cell !important;
    }

    .d-flex {
        display: -webkit-box !important;
        display: -ms-flexbox !important;
        display: flex !important;
    }

    .d-inline-flex {
        display: -webkit-inline-box !important;
        display: -ms-inline-flexbox !important;
        display: inline-flex !important;
    }

    @media (min-width: 576px) {
        .d-sm-none {
            display: none !important;
        }

        .d-sm-inline {
            display: inline !important;
        }

        .d-sm-inline-block {
            display: inline-block !important;
        }

        .d-sm-block {
            display: block !important;
        }

        .d-sm-table {
            display: table !important;
        }

        .d-sm-table-row {
            display: table-row !important;
        }

        .d-sm-table-cell {
            display: table-cell !important;
        }

        .d-sm-flex {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
        }

        .d-sm-inline-flex {
            display: -webkit-inline-box !important;
            display: -ms-inline-flexbox !important;
            display: inline-flex !important;
        }
    }

    @media (min-width: 768px) {
        .d-md-none {
            display: none !important;
        }

        .d-md-inline {
            display: inline !important;
        }

        .d-md-inline-block {
            display: inline-block !important;
        }

        .d-md-block {
            display: block !important;
        }

        .d-md-table {
            display: table !important;
        }

        .d-md-table-row {
            display: table-row !important;
        }

        .d-md-table-cell {
            display: table-cell !important;
        }

        .d-md-flex {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
        }

        .d-md-inline-flex {
            display: -webkit-inline-box !important;
            display: -ms-inline-flexbox !important;
            display: inline-flex !important;
        }
    }

    @media (min-width: 992px) {
        .d-lg-none {
            display: none !important;
        }

        .d-lg-inline {
            display: inline !important;
        }

        .d-lg-inline-block {
            display: inline-block !important;
        }

        .d-lg-block {
            display: block !important;
        }

        .d-lg-table {
            display: table !important;
        }

        .d-lg-table-row {
            display: table-row !important;
        }

        .d-lg-table-cell {
            display: table-cell !important;
        }

        .d-lg-flex {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
        }

        .d-lg-inline-flex {
            display: -webkit-inline-box !important;
            display: -ms-inline-flexbox !important;
            display: inline-flex !important;
        }
    }

    @media (min-width: 1200px) {
        .d-xl-none {
            display: none !important;
        }

        .d-xl-inline {
            display: inline !important;
        }

        .d-xl-inline-block {
            display: inline-block !important;
        }

        .d-xl-block {
            display: block !important;
        }

        .d-xl-table {
            display: table !important;
        }

        .d-xl-table-row {
            display: table-row !important;
        }

        .d-xl-table-cell {
            display: table-cell !important;
        }

        .d-xl-flex {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
        }

        .d-xl-inline-flex {
            display: -webkit-inline-box !important;
            display: -ms-inline-flexbox !important;
            display: inline-flex !important;
        }
    }

    .d-print-block {
        display: none !important;
    }

    @media print {
        .d-print-block {
            display: block !important;
        }
    }

    .d-print-inline {
        display: none !important;
    }

    @media print {
        .d-print-inline {
            display: inline !important;
        }
    }

    .d-print-inline-block {
        display: none !important;
    }

    @media print {
        .d-print-inline-block {
            display: inline-block !important;
        }
    }

    @media print {
        .d-print-none {
            display: none !important;
        }
    }

    .embed-responsive {
        position: relative;
        display: block;
        width: 100%;
        padding: 0;
        overflow: hidden;
    }

    .embed-responsive::before {
        display: block;
        content: "";
    }

    .embed-responsive .embed-responsive-item,
    .embed-responsive iframe,
    .embed-responsive embed,
    .embed-responsive object,
    .embed-responsive video {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }

    .embed-responsive-21by9::before {
        padding-top: 42.85714286%;
    }

    .embed-responsive-16by9::before {
        padding-top: 56.25%;
    }

    .embed-responsive-4by3::before {
        padding-top: 75%;
    }

    .embed-responsive-1by1::before {
        padding-top: 100%;
    }

    .flex-row {
        -webkit-box-orient: horizontal !important;
        -webkit-box-direction: normal !important;
        -ms-flex-direction: row !important;
        flex-direction: row !important;
    }

    .flex-column {
        -webkit-box-orient: vertical !important;
        -webkit-box-direction: normal !important;
        -ms-flex-direction: column !important;
        flex-direction: column !important;
    }

    .flex-row-reverse {
        -webkit-box-orient: horizontal !important;
        -webkit-box-direction: reverse !important;
        -ms-flex-direction: row-reverse !important;
        flex-direction: row-reverse !important;
    }

    .flex-column-reverse {
        -webkit-box-orient: vertical !important;
        -webkit-box-direction: reverse !important;
        -ms-flex-direction: column-reverse !important;
        flex-direction: column-reverse !important;
    }

    .flex-wrap {
        -ms-flex-wrap: wrap !important;
        flex-wrap: wrap !important;
    }

    .flex-nowrap {
        -ms-flex-wrap: nowrap !important;
        flex-wrap: nowrap !important;
    }

    .flex-wrap-reverse {
        -ms-flex-wrap: wrap-reverse !important;
        flex-wrap: wrap-reverse !important;
    }

    .justify-content-start {
        -webkit-box-pack: start !important;
        -ms-flex-pack: start !important;
        justify-content: flex-start !important;
    }

    .justify-content-end {
        -webkit-box-pack: end !important;
        -ms-flex-pack: end !important;
        justify-content: flex-end !important;
    }

    .justify-content-center {
        -webkit-box-pack: center !important;
        -ms-flex-pack: center !important;
        justify-content: center !important;
    }

    .justify-content-between {
        -webkit-box-pack: justify !important;
        -ms-flex-pack: justify !important;
        justify-content: space-between !important;
    }

    .justify-content-around {
        -ms-flex-pack: distribute !important;
        justify-content: space-around !important;
    }

    .align-items-start {
        -webkit-box-align: start !important;
        -ms-flex-align: start !important;
        align-items: flex-start !important;
    }

    .align-items-end {
        -webkit-box-align: end !important;
        -ms-flex-align: end !important;
        align-items: flex-end !important;
    }

    .align-items-center {
        -webkit-box-align: center !important;
        -ms-flex-align: center !important;
        align-items: center !important;
    }

    .align-items-baseline {
        -webkit-box-align: baseline !important;
        -ms-flex-align: baseline !important;
        align-items: baseline !important;
    }

    .align-items-stretch {
        -webkit-box-align: stretch !important;
        -ms-flex-align: stretch !important;
        align-items: stretch !important;
    }

    .align-content-start {
        -ms-flex-line-pack: start !important;
        align-content: flex-start !important;
    }

    .align-content-end {
        -ms-flex-line-pack: end !important;
        align-content: flex-end !important;
    }

    .align-content-center {
        -ms-flex-line-pack: center !important;
        align-content: center !important;
    }

    .align-content-between {
        -ms-flex-line-pack: justify !important;
        align-content: space-between !important;
    }

    .align-content-around {
        -ms-flex-line-pack: distribute !important;
        align-content: space-around !important;
    }

    .align-content-stretch {
        -ms-flex-line-pack: stretch !important;
        align-content: stretch !important;
    }

    .align-self-auto {
        -ms-flex-item-align: auto !important;
        -ms-grid-row-align: auto !important;
        align-self: auto !important;
    }

    .align-self-start {
        -ms-flex-item-align: start !important;
        align-self: flex-start !important;
    }

    .align-self-end {
        -ms-flex-item-align: end !important;
        align-self: flex-end !important;
    }

    .align-self-center {
        -ms-flex-item-align: center !important;
        -ms-grid-row-align: center !important;
        align-self: center !important;
    }

    .align-self-baseline {
        -ms-flex-item-align: baseline !important;
        align-self: baseline !important;
    }

    .align-self-stretch {
        -ms-flex-item-align: stretch !important;
        -ms-grid-row-align: stretch !important;
        align-self: stretch !important;
    }

    @media (min-width: 576px) {
        .flex-sm-row {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: row !important;
            flex-direction: row !important;
        }

        .flex-sm-column {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: column !important;
            flex-direction: column !important;
        }

        .flex-sm-row-reverse {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: row-reverse !important;
            flex-direction: row-reverse !important;
        }

        .flex-sm-column-reverse {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: column-reverse !important;
            flex-direction: column-reverse !important;
        }

        .flex-sm-wrap {
            -ms-flex-wrap: wrap !important;
            flex-wrap: wrap !important;
        }

        .flex-sm-nowrap {
            -ms-flex-wrap: nowrap !important;
            flex-wrap: nowrap !important;
        }

        .flex-sm-wrap-reverse {
            -ms-flex-wrap: wrap-reverse !important;
            flex-wrap: wrap-reverse !important;
        }

        .justify-content-sm-start {
            -webkit-box-pack: start !important;
            -ms-flex-pack: start !important;
            justify-content: flex-start !important;
        }

        .justify-content-sm-end {
            -webkit-box-pack: end !important;
            -ms-flex-pack: end !important;
            justify-content: flex-end !important;
        }

        .justify-content-sm-center {
            -webkit-box-pack: center !important;
            -ms-flex-pack: center !important;
            justify-content: center !important;
        }

        .justify-content-sm-between {
            -webkit-box-pack: justify !important;
            -ms-flex-pack: justify !important;
            justify-content: space-between !important;
        }

        .justify-content-sm-around {
            -ms-flex-pack: distribute !important;
            justify-content: space-around !important;
        }

        .align-items-sm-start {
            -webkit-box-align: start !important;
            -ms-flex-align: start !important;
            align-items: flex-start !important;
        }

        .align-items-sm-end {
            -webkit-box-align: end !important;
            -ms-flex-align: end !important;
            align-items: flex-end !important;
        }

        .align-items-sm-center {
            -webkit-box-align: center !important;
            -ms-flex-align: center !important;
            align-items: center !important;
        }

        .align-items-sm-baseline {
            -webkit-box-align: baseline !important;
            -ms-flex-align: baseline !important;
            align-items: baseline !important;
        }

        .align-items-sm-stretch {
            -webkit-box-align: stretch !important;
            -ms-flex-align: stretch !important;
            align-items: stretch !important;
        }

        .align-content-sm-start {
            -ms-flex-line-pack: start !important;
            align-content: flex-start !important;
        }

        .align-content-sm-end {
            -ms-flex-line-pack: end !important;
            align-content: flex-end !important;
        }

        .align-content-sm-center {
            -ms-flex-line-pack: center !important;
            align-content: center !important;
        }

        .align-content-sm-between {
            -ms-flex-line-pack: justify !important;
            align-content: space-between !important;
        }

        .align-content-sm-around {
            -ms-flex-line-pack: distribute !important;
            align-content: space-around !important;
        }

        .align-content-sm-stretch {
            -ms-flex-line-pack: stretch !important;
            align-content: stretch !important;
        }

        .align-self-sm-auto {
            -ms-flex-item-align: auto !important;
            -ms-grid-row-align: auto !important;
            align-self: auto !important;
        }

        .align-self-sm-start {
            -ms-flex-item-align: start !important;
            align-self: flex-start !important;
        }

        .align-self-sm-end {
            -ms-flex-item-align: end !important;
            align-self: flex-end !important;
        }

        .align-self-sm-center {
            -ms-flex-item-align: center !important;
            -ms-grid-row-align: center !important;
            align-self: center !important;
        }

        .align-self-sm-baseline {
            -ms-flex-item-align: baseline !important;
            align-self: baseline !important;
        }

        .align-self-sm-stretch {
            -ms-flex-item-align: stretch !important;
            -ms-grid-row-align: stretch !important;
            align-self: stretch !important;
        }
    }

    @media (min-width: 768px) {
        .flex-md-row {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: row !important;
            flex-direction: row !important;
        }

        .flex-md-column {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: column !important;
            flex-direction: column !important;
        }

        .flex-md-row-reverse {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: row-reverse !important;
            flex-direction: row-reverse !important;
        }

        .flex-md-column-reverse {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: column-reverse !important;
            flex-direction: column-reverse !important;
        }

        .flex-md-wrap {
            -ms-flex-wrap: wrap !important;
            flex-wrap: wrap !important;
        }

        .flex-md-nowrap {
            -ms-flex-wrap: nowrap !important;
            flex-wrap: nowrap !important;
        }

        .flex-md-wrap-reverse {
            -ms-flex-wrap: wrap-reverse !important;
            flex-wrap: wrap-reverse !important;
        }

        .justify-content-md-start {
            -webkit-box-pack: start !important;
            -ms-flex-pack: start !important;
            justify-content: flex-start !important;
        }

        .justify-content-md-end {
            -webkit-box-pack: end !important;
            -ms-flex-pack: end !important;
            justify-content: flex-end !important;
        }

        .justify-content-md-center {
            -webkit-box-pack: center !important;
            -ms-flex-pack: center !important;
            justify-content: center !important;
        }

        .justify-content-md-between {
            -webkit-box-pack: justify !important;
            -ms-flex-pack: justify !important;
            justify-content: space-between !important;
        }

        .justify-content-md-around {
            -ms-flex-pack: distribute !important;
            justify-content: space-around !important;
        }

        .align-items-md-start {
            -webkit-box-align: start !important;
            -ms-flex-align: start !important;
            align-items: flex-start !important;
        }

        .align-items-md-end {
            -webkit-box-align: end !important;
            -ms-flex-align: end !important;
            align-items: flex-end !important;
        }

        .align-items-md-center {
            -webkit-box-align: center !important;
            -ms-flex-align: center !important;
            align-items: center !important;
        }

        .align-items-md-baseline {
            -webkit-box-align: baseline !important;
            -ms-flex-align: baseline !important;
            align-items: baseline !important;
        }

        .align-items-md-stretch {
            -webkit-box-align: stretch !important;
            -ms-flex-align: stretch !important;
            align-items: stretch !important;
        }

        .align-content-md-start {
            -ms-flex-line-pack: start !important;
            align-content: flex-start !important;
        }

        .align-content-md-end {
            -ms-flex-line-pack: end !important;
            align-content: flex-end !important;
        }

        .align-content-md-center {
            -ms-flex-line-pack: center !important;
            align-content: center !important;
        }

        .align-content-md-between {
            -ms-flex-line-pack: justify !important;
            align-content: space-between !important;
        }

        .align-content-md-around {
            -ms-flex-line-pack: distribute !important;
            align-content: space-around !important;
        }

        .align-content-md-stretch {
            -ms-flex-line-pack: stretch !important;
            align-content: stretch !important;
        }

        .align-self-md-auto {
            -ms-flex-item-align: auto !important;
            -ms-grid-row-align: auto !important;
            align-self: auto !important;
        }

        .align-self-md-start {
            -ms-flex-item-align: start !important;
            align-self: flex-start !important;
        }

        .align-self-md-end {
            -ms-flex-item-align: end !important;
            align-self: flex-end !important;
        }

        .align-self-md-center {
            -ms-flex-item-align: center !important;
            -ms-grid-row-align: center !important;
            align-self: center !important;
        }

        .align-self-md-baseline {
            -ms-flex-item-align: baseline !important;
            align-self: baseline !important;
        }

        .align-self-md-stretch {
            -ms-flex-item-align: stretch !important;
            -ms-grid-row-align: stretch !important;
            align-self: stretch !important;
        }
    }

    @media (min-width: 992px) {
        .flex-lg-row {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: row !important;
            flex-direction: row !important;
        }

        .flex-lg-column {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: column !important;
            flex-direction: column !important;
        }

        .flex-lg-row-reverse {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: row-reverse !important;
            flex-direction: row-reverse !important;
        }

        .flex-lg-column-reverse {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: column-reverse !important;
            flex-direction: column-reverse !important;
        }

        .flex-lg-wrap {
            -ms-flex-wrap: wrap !important;
            flex-wrap: wrap !important;
        }

        .flex-lg-nowrap {
            -ms-flex-wrap: nowrap !important;
            flex-wrap: nowrap !important;
        }

        .flex-lg-wrap-reverse {
            -ms-flex-wrap: wrap-reverse !important;
            flex-wrap: wrap-reverse !important;
        }

        .justify-content-lg-start {
            -webkit-box-pack: start !important;
            -ms-flex-pack: start !important;
            justify-content: flex-start !important;
        }

        .justify-content-lg-end {
            -webkit-box-pack: end !important;
            -ms-flex-pack: end !important;
            justify-content: flex-end !important;
        }

        .justify-content-lg-center {
            -webkit-box-pack: center !important;
            -ms-flex-pack: center !important;
            justify-content: center !important;
        }

        .justify-content-lg-between {
            -webkit-box-pack: justify !important;
            -ms-flex-pack: justify !important;
            justify-content: space-between !important;
        }

        .justify-content-lg-around {
            -ms-flex-pack: distribute !important;
            justify-content: space-around !important;
        }

        .align-items-lg-start {
            -webkit-box-align: start !important;
            -ms-flex-align: start !important;
            align-items: flex-start !important;
        }

        .align-items-lg-end {
            -webkit-box-align: end !important;
            -ms-flex-align: end !important;
            align-items: flex-end !important;
        }

        .align-items-lg-center {
            -webkit-box-align: center !important;
            -ms-flex-align: center !important;
            align-items: center !important;
        }

        .align-items-lg-baseline {
            -webkit-box-align: baseline !important;
            -ms-flex-align: baseline !important;
            align-items: baseline !important;
        }

        .align-items-lg-stretch {
            -webkit-box-align: stretch !important;
            -ms-flex-align: stretch !important;
            align-items: stretch !important;
        }

        .align-content-lg-start {
            -ms-flex-line-pack: start !important;
            align-content: flex-start !important;
        }

        .align-content-lg-end {
            -ms-flex-line-pack: end !important;
            align-content: flex-end !important;
        }

        .align-content-lg-center {
            -ms-flex-line-pack: center !important;
            align-content: center !important;
        }

        .align-content-lg-between {
            -ms-flex-line-pack: justify !important;
            align-content: space-between !important;
        }

        .align-content-lg-around {
            -ms-flex-line-pack: distribute !important;
            align-content: space-around !important;
        }

        .align-content-lg-stretch {
            -ms-flex-line-pack: stretch !important;
            align-content: stretch !important;
        }

        .align-self-lg-auto {
            -ms-flex-item-align: auto !important;
            -ms-grid-row-align: auto !important;
            align-self: auto !important;
        }

        .align-self-lg-start {
            -ms-flex-item-align: start !important;
            align-self: flex-start !important;
        }

        .align-self-lg-end {
            -ms-flex-item-align: end !important;
            align-self: flex-end !important;
        }

        .align-self-lg-center {
            -ms-flex-item-align: center !important;
            -ms-grid-row-align: center !important;
            align-self: center !important;
        }

        .align-self-lg-baseline {
            -ms-flex-item-align: baseline !important;
            align-self: baseline !important;
        }

        .align-self-lg-stretch {
            -ms-flex-item-align: stretch !important;
            -ms-grid-row-align: stretch !important;
            align-self: stretch !important;
        }
    }

    @media (min-width: 1200px) {
        .flex-xl-row {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: row !important;
            flex-direction: row !important;
        }

        .flex-xl-column {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: normal !important;
            -ms-flex-direction: column !important;
            flex-direction: column !important;
        }

        .flex-xl-row-reverse {
            -webkit-box-orient: horizontal !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: row-reverse !important;
            flex-direction: row-reverse !important;
        }

        .flex-xl-column-reverse {
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: reverse !important;
            -ms-flex-direction: column-reverse !important;
            flex-direction: column-reverse !important;
        }

        .flex-xl-wrap {
            -ms-flex-wrap: wrap !important;
            flex-wrap: wrap !important;
        }

        .flex-xl-nowrap {
            -ms-flex-wrap: nowrap !important;
            flex-wrap: nowrap !important;
        }

        .flex-xl-wrap-reverse {
            -ms-flex-wrap: wrap-reverse !important;
            flex-wrap: wrap-reverse !important;
        }

        .justify-content-xl-start {
            -webkit-box-pack: start !important;
            -ms-flex-pack: start !important;
            justify-content: flex-start !important;
        }

        .justify-content-xl-end {
            -webkit-box-pack: end !important;
            -ms-flex-pack: end !important;
            justify-content: flex-end !important;
        }

        .justify-content-xl-center {
            -webkit-box-pack: center !important;
            -ms-flex-pack: center !important;
            justify-content: center !important;
        }

        .justify-content-xl-between {
            -webkit-box-pack: justify !important;
            -ms-flex-pack: justify !important;
            justify-content: space-between !important;
        }

        .justify-content-xl-around {
            -ms-flex-pack: distribute !important;
            justify-content: space-around !important;
        }

        .align-items-xl-start {
            -webkit-box-align: start !important;
            -ms-flex-align: start !important;
            align-items: flex-start !important;
        }

        .align-items-xl-end {
            -webkit-box-align: end !important;
            -ms-flex-align: end !important;
            align-items: flex-end !important;
        }

        .align-items-xl-center {
            -webkit-box-align: center !important;
            -ms-flex-align: center !important;
            align-items: center !important;
        }

        .align-items-xl-baseline {
            -webkit-box-align: baseline !important;
            -ms-flex-align: baseline !important;
            align-items: baseline !important;
        }

        .align-items-xl-stretch {
            -webkit-box-align: stretch !important;
            -ms-flex-align: stretch !important;
            align-items: stretch !important;
        }

        .align-content-xl-start {
            -ms-flex-line-pack: start !important;
            align-content: flex-start !important;
        }

        .align-content-xl-end {
            -ms-flex-line-pack: end !important;
            align-content: flex-end !important;
        }

        .align-content-xl-center {
            -ms-flex-line-pack: center !important;
            align-content: center !important;
        }

        .align-content-xl-between {
            -ms-flex-line-pack: justify !important;
            align-content: space-between !important;
        }

        .align-content-xl-around {
            -ms-flex-line-pack: distribute !important;
            align-content: space-around !important;
        }

        .align-content-xl-stretch {
            -ms-flex-line-pack: stretch !important;
            align-content: stretch !important;
        }

        .align-self-xl-auto {
            -ms-flex-item-align: auto !important;
            -ms-grid-row-align: auto !important;
            align-self: auto !important;
        }

        .align-self-xl-start {
            -ms-flex-item-align: start !important;
            align-self: flex-start !important;
        }

        .align-self-xl-end {
            -ms-flex-item-align: end !important;
            align-self: flex-end !important;
        }

        .align-self-xl-center {
            -ms-flex-item-align: center !important;
            -ms-grid-row-align: center !important;
            align-self: center !important;
        }

        .align-self-xl-baseline {
            -ms-flex-item-align: baseline !important;
            align-self: baseline !important;
        }

        .align-self-xl-stretch {
            -ms-flex-item-align: stretch !important;
            -ms-grid-row-align: stretch !important;
            align-self: stretch !important;
        }
    }

    .float-left {
        float: left !important;
    }

    .float-right {
        float: right !important;
    }

    .float-none {
        float: none !important;
    }

    @media (min-width: 576px) {
        .float-sm-left {
            float: left !important;
        }

        .float-sm-right {
            float: right !important;
        }

        .float-sm-none {
            float: none !important;
        }
    }

    @media (min-width: 768px) {
        .float-md-left {
            float: left !important;
        }

        .float-md-right {
            float: right !important;
        }

        .float-md-none {
            float: none !important;
        }
    }

    @media (min-width: 992px) {
        .float-lg-left {
            float: left !important;
        }

        .float-lg-right {
            float: right !important;
        }

        .float-lg-none {
            float: none !important;
        }
    }

    @media (min-width: 1200px) {
        .float-xl-left {
            float: left !important;
        }

        .float-xl-right {
            float: right !important;
        }

        .float-xl-none {
            float: none !important;
        }
    }

    .position-static {
        position: static !important;
    }

    .position-relative {
        position: relative !important;
    }

    .position-absolute {
        position: absolute !important;
    }

    .position-fixed {
        position: fixed !important;
    }

    .position-sticky {
        position: -webkit-sticky !important;
        position: sticky !important;
    }

    .fixed-top {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        z-index: 1030;
    }

    .fixed-bottom {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1030;
    }

    @supports ((position: -webkit-sticky) or (position: sticky)) {
        .sticky-top {
            position: -webkit-sticky;
            position: sticky;
            top: 0;
            z-index: 1020;
        }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        -webkit-clip-path: inset(50%);
        clip-path: inset(50%);
        border: 0;
    }

    .sr-only-focusable:active, .sr-only-focusable:focus {
        position: static;
        width: auto;
        height: auto;
        overflow: visible;
        clip: auto;
        white-space: normal;
        -webkit-clip-path: none;
        clip-path: none;
    }

    .w-25 {
        width: 25% !important;
    }

    .w-50 {
        width: 50% !important;
    }

    .w-75 {
        width: 75% !important;
    }

    .w-100 {
        width: 100% !important;
    }

    .h-25 {
        height: 25% !important;
    }

    .h-50 {
        height: 50% !important;
    }

    .h-75 {
        height: 75% !important;
    }

    .h-100 {
        height: 100% !important;
    }

    .mw-100 {
        max-width: 100% !important;
    }

    .mh-100 {
        max-height: 100% !important;
    }

    .m-0 {
        margin: 0 !important;
    }

    .mt-0,
    .my-0 {
        margin-top: 0 !important;
    }

    .mr-0,
    .mx-0 {
        margin-right: 0 !important;
    }

    .mb-0,
    .my-0 {
        margin-bottom: 0 !important;
    }

    .ml-0,
    .mx-0 {
        margin-left: 0 !important;
    }

    .m-1 {
        margin: 0.25rem !important;
    }

    .mt-1,
    .my-1 {
        margin-top: 0.25rem !important;
    }

    .mr-1,
    .mx-1 {
        margin-right: 0.25rem !important;
    }

    .mb-1,
    .my-1 {
        margin-bottom: 0.25rem !important;
    }

    .ml-1,
    .mx-1 {
        margin-left: 0.25rem !important;
    }

    .m-2 {
        margin: 0.5rem !important;
    }

    .mt-2,
    .my-2 {
        margin-top: 0.5rem !important;
    }

    .mr-2,
    .mx-2 {
        margin-right: 0.5rem !important;
    }

    .mb-2,
    .my-2 {
        margin-bottom: 0.5rem !important;
    }

    .ml-2,
    .mx-2 {
        margin-left: 0.5rem !important;
    }

    .m-3 {
        margin: 1rem !important;
    }

    .mt-3,
    .my-3 {
        margin-top: 1rem !important;
    }

    .mr-3,
    .mx-3 {
        margin-right: 1rem !important;
    }

    .mb-3,
    .my-3 {
        margin-bottom: 1rem !important;
    }

    .ml-3,
    .mx-3 {
        margin-left: 1rem !important;
    }

    .m-4 {
        margin: 1.5rem !important;
    }

    .mt-4,
    .my-4 {
        margin-top: 1.5rem !important;
    }

    .mr-4,
    .mx-4 {
        margin-right: 1.5rem !important;
    }

    .mb-4,
    .my-4 {
        margin-bottom: 1.5rem !important;
    }

    .ml-4,
    .mx-4 {
        margin-left: 1.5rem !important;
    }

    .m-5 {
        margin: 3rem !important;
    }

    .mt-5,
    .my-5 {
        margin-top: 3rem !important;
    }

    .mr-5,
    .mx-5 {
        margin-right: 3rem !important;
    }

    .mb-5,
    .my-5 {
        margin-bottom: 3rem !important;
    }

    .ml-5,
    .mx-5 {
        margin-left: 3rem !important;
    }

    .p-0 {
        padding: 0 !important;
    }

    .pt-0,
    .py-0 {
        padding-top: 0 !important;
    }

    .pr-0,
    .px-0 {
        padding-right: 0 !important;
    }

    .pb-0,
    .py-0 {
        padding-bottom: 0 !important;
    }

    .pl-0,
    .px-0 {
        padding-left: 0 !important;
    }

    .p-1 {
        padding: 0.25rem !important;
    }

    .pt-1,
    .py-1 {
        padding-top: 0.25rem !important;
    }

    .pr-1,
    .px-1 {
        padding-right: 0.25rem !important;
    }

    .pb-1,
    .py-1 {
        padding-bottom: 0.25rem !important;
    }

    .pl-1,
    .px-1 {
        padding-left: 0.25rem !important;
    }

    .p-2 {
        padding: 0.5rem !important;
    }

    .pt-2,
    .py-2 {
        padding-top: 0.5rem !important;
    }

    .pr-2,
    .px-2 {
        padding-right: 0.5rem !important;
    }

    .pb-2,
    .py-2 {
        padding-bottom: 0.5rem !important;
    }

    .pl-2,
    .px-2 {
        padding-left: 0.5rem !important;
    }

    .p-3 {
        padding: 1rem !important;
    }

    .pt-3,
    .py-3 {
        padding-top: 1rem !important;
    }

    .pr-3,
    .px-3 {
        padding-right: 1rem !important;
    }

    .pb-3,
    .py-3 {
        padding-bottom: 1rem !important;
    }

    .pl-3,
    .px-3 {
        padding-left: 1rem !important;
    }

    .p-4 {
        padding: 1.5rem !important;
    }

    .pt-4,
    .py-4 {
        padding-top: 1.5rem !important;
    }

    .pr-4,
    .px-4 {
        padding-right: 1.5rem !important;
    }

    .pb-4,
    .py-4 {
        padding-bottom: 1.5rem !important;
    }

    .pl-4,
    .px-4 {
        padding-left: 1.5rem !important;
    }

    .p-5 {
        padding: 3rem !important;
    }

    .pt-5,
    .py-5 {
        padding-top: 3rem !important;
    }

    .pr-5,
    .px-5 {
        padding-right: 3rem !important;
    }

    .pb-5,
    .py-5 {
        padding-bottom: 3rem !important;
    }

    .pl-5,
    .px-5 {
        padding-left: 3rem !important;
    }

    .m-auto {
        margin: auto !important;
    }

    .mt-auto,
    .my-auto {
        margin-top: auto !important;
    }

    .mr-auto,
    .mx-auto {
        margin-right: auto !important;
    }

    .mb-auto,
    .my-auto {
        margin-bottom: auto !important;
    }

    .ml-auto,
    .mx-auto {
        margin-left: auto !important;
    }

    @media (min-width: 576px) {
        .m-sm-0 {
            margin: 0 !important;
        }

        .mt-sm-0,
        .my-sm-0 {
            margin-top: 0 !important;
        }

        .mr-sm-0,
        .mx-sm-0 {
            margin-right: 0 !important;
        }

        .mb-sm-0,
        .my-sm-0 {
            margin-bottom: 0 !important;
        }

        .ml-sm-0,
        .mx-sm-0 {
            margin-left: 0 !important;
        }

        .m-sm-1 {
            margin: 0.25rem !important;
        }

        .mt-sm-1,
        .my-sm-1 {
            margin-top: 0.25rem !important;
        }

        .mr-sm-1,
        .mx-sm-1 {
            margin-right: 0.25rem !important;
        }

        .mb-sm-1,
        .my-sm-1 {
            margin-bottom: 0.25rem !important;
        }

        .ml-sm-1,
        .mx-sm-1 {
            margin-left: 0.25rem !important;
        }

        .m-sm-2 {
            margin: 0.5rem !important;
        }

        .mt-sm-2,
        .my-sm-2 {
            margin-top: 0.5rem !important;
        }

        .mr-sm-2,
        .mx-sm-2 {
            margin-right: 0.5rem !important;
        }

        .mb-sm-2,
        .my-sm-2 {
            margin-bottom: 0.5rem !important;
        }

        .ml-sm-2,
        .mx-sm-2 {
            margin-left: 0.5rem !important;
        }

        .m-sm-3 {
            margin: 1rem !important;
        }

        .mt-sm-3,
        .my-sm-3 {
            margin-top: 1rem !important;
        }

        .mr-sm-3,
        .mx-sm-3 {
            margin-right: 1rem !important;
        }

        .mb-sm-3,
        .my-sm-3 {
            margin-bottom: 1rem !important;
        }

        .ml-sm-3,
        .mx-sm-3 {
            margin-left: 1rem !important;
        }

        .m-sm-4 {
            margin: 1.5rem !important;
        }

        .mt-sm-4,
        .my-sm-4 {
            margin-top: 1.5rem !important;
        }

        .mr-sm-4,
        .mx-sm-4 {
            margin-right: 1.5rem !important;
        }

        .mb-sm-4,
        .my-sm-4 {
            margin-bottom: 1.5rem !important;
        }

        .ml-sm-4,
        .mx-sm-4 {
            margin-left: 1.5rem !important;
        }

        .m-sm-5 {
            margin: 3rem !important;
        }

        .mt-sm-5,
        .my-sm-5 {
            margin-top: 3rem !important;
        }

        .mr-sm-5,
        .mx-sm-5 {
            margin-right: 3rem !important;
        }

        .mb-sm-5,
        .my-sm-5 {
            margin-bottom: 3rem !important;
        }

        .ml-sm-5,
        .mx-sm-5 {
            margin-left: 3rem !important;
        }

        .p-sm-0 {
            padding: 0 !important;
        }

        .pt-sm-0,
        .py-sm-0 {
            padding-top: 0 !important;
        }

        .pr-sm-0,
        .px-sm-0 {
            padding-right: 0 !important;
        }

        .pb-sm-0,
        .py-sm-0 {
            padding-bottom: 0 !important;
        }

        .pl-sm-0,
        .px-sm-0 {
            padding-left: 0 !important;
        }

        .p-sm-1 {
            padding: 0.25rem !important;
        }

        .pt-sm-1,
        .py-sm-1 {
            padding-top: 0.25rem !important;
        }

        .pr-sm-1,
        .px-sm-1 {
            padding-right: 0.25rem !important;
        }

        .pb-sm-1,
        .py-sm-1 {
            padding-bottom: 0.25rem !important;
        }

        .pl-sm-1,
        .px-sm-1 {
            padding-left: 0.25rem !important;
        }

        .p-sm-2 {
            padding: 0.5rem !important;
        }

        .pt-sm-2,
        .py-sm-2 {
            padding-top: 0.5rem !important;
        }

        .pr-sm-2,
        .px-sm-2 {
            padding-right: 0.5rem !important;
        }

        .pb-sm-2,
        .py-sm-2 {
            padding-bottom: 0.5rem !important;
        }

        .pl-sm-2,
        .px-sm-2 {
            padding-left: 0.5rem !important;
        }

        .p-sm-3 {
            padding: 1rem !important;
        }

        .pt-sm-3,
        .py-sm-3 {
            padding-top: 1rem !important;
        }

        .pr-sm-3,
        .px-sm-3 {
            padding-right: 1rem !important;
        }

        .pb-sm-3,
        .py-sm-3 {
            padding-bottom: 1rem !important;
        }

        .pl-sm-3,
        .px-sm-3 {
            padding-left: 1rem !important;
        }

        .p-sm-4 {
            padding: 1.5rem !important;
        }

        .pt-sm-4,
        .py-sm-4 {
            padding-top: 1.5rem !important;
        }

        .pr-sm-4,
        .px-sm-4 {
            padding-right: 1.5rem !important;
        }

        .pb-sm-4,
        .py-sm-4 {
            padding-bottom: 1.5rem !important;
        }

        .pl-sm-4,
        .px-sm-4 {
            padding-left: 1.5rem !important;
        }

        .p-sm-5 {
            padding: 3rem !important;
        }

        .pt-sm-5,
        .py-sm-5 {
            padding-top: 3rem !important;
        }

        .pr-sm-5,
        .px-sm-5 {
            padding-right: 3rem !important;
        }

        .pb-sm-5,
        .py-sm-5 {
            padding-bottom: 3rem !important;
        }

        .pl-sm-5,
        .px-sm-5 {
            padding-left: 3rem !important;
        }

        .m-sm-auto {
            margin: auto !important;
        }

        .mt-sm-auto,
        .my-sm-auto {
            margin-top: auto !important;
        }

        .mr-sm-auto,
        .mx-sm-auto {
            margin-right: auto !important;
        }

        .mb-sm-auto,
        .my-sm-auto {
            margin-bottom: auto !important;
        }

        .ml-sm-auto,
        .mx-sm-auto {
            margin-left: auto !important;
        }
    }

    @media (min-width: 768px) {
        .m-md-0 {
            margin: 0 !important;
        }

        .mt-md-0,
        .my-md-0 {
            margin-top: 0 !important;
        }

        .mr-md-0,
        .mx-md-0 {
            margin-right: 0 !important;
        }

        .mb-md-0,
        .my-md-0 {
            margin-bottom: 0 !important;
        }

        .ml-md-0,
        .mx-md-0 {
            margin-left: 0 !important;
        }

        .m-md-1 {
            margin: 0.25rem !important;
        }

        .mt-md-1,
        .my-md-1 {
            margin-top: 0.25rem !important;
        }

        .mr-md-1,
        .mx-md-1 {
            margin-right: 0.25rem !important;
        }

        .mb-md-1,
        .my-md-1 {
            margin-bottom: 0.25rem !important;
        }

        .ml-md-1,
        .mx-md-1 {
            margin-left: 0.25rem !important;
        }

        .m-md-2 {
            margin: 0.5rem !important;
        }

        .mt-md-2,
        .my-md-2 {
            margin-top: 0.5rem !important;
        }

        .mr-md-2,
        .mx-md-2 {
            margin-right: 0.5rem !important;
        }

        .mb-md-2,
        .my-md-2 {
            margin-bottom: 0.5rem !important;
        }

        .ml-md-2,
        .mx-md-2 {
            margin-left: 0.5rem !important;
        }

        .m-md-3 {
            margin: 1rem !important;
        }

        .mt-md-3,
        .my-md-3 {
            margin-top: 1rem !important;
        }

        .mr-md-3,
        .mx-md-3 {
            margin-right: 1rem !important;
        }

        .mb-md-3,
        .my-md-3 {
            margin-bottom: 1rem !important;
        }

        .ml-md-3,
        .mx-md-3 {
            margin-left: 1rem !important;
        }

        .m-md-4 {
            margin: 1.5rem !important;
        }

        .mt-md-4,
        .my-md-4 {
            margin-top: 1.5rem !important;
        }

        .mr-md-4,
        .mx-md-4 {
            margin-right: 1.5rem !important;
        }

        .mb-md-4,
        .my-md-4 {
            margin-bottom: 1.5rem !important;
        }

        .ml-md-4,
        .mx-md-4 {
            margin-left: 1.5rem !important;
        }

        .m-md-5 {
            margin: 3rem !important;
        }

        .mt-md-5,
        .my-md-5 {
            margin-top: 3rem !important;
        }

        .mr-md-5,
        .mx-md-5 {
            margin-right: 3rem !important;
        }

        .mb-md-5,
        .my-md-5 {
            margin-bottom: 3rem !important;
        }

        .ml-md-5,
        .mx-md-5 {
            margin-left: 3rem !important;
        }

        .p-md-0 {
            padding: 0 !important;
        }

        .pt-md-0,
        .py-md-0 {
            padding-top: 0 !important;
        }

        .pr-md-0,
        .px-md-0 {
            padding-right: 0 !important;
        }

        .pb-md-0,
        .py-md-0 {
            padding-bottom: 0 !important;
        }

        .pl-md-0,
        .px-md-0 {
            padding-left: 0 !important;
        }

        .p-md-1 {
            padding: 0.25rem !important;
        }

        .pt-md-1,
        .py-md-1 {
            padding-top: 0.25rem !important;
        }

        .pr-md-1,
        .px-md-1 {
            padding-right: 0.25rem !important;
        }

        .pb-md-1,
        .py-md-1 {
            padding-bottom: 0.25rem !important;
        }

        .pl-md-1,
        .px-md-1 {
            padding-left: 0.25rem !important;
        }

        .p-md-2 {
            padding: 0.5rem !important;
        }

        .pt-md-2,
        .py-md-2 {
            padding-top: 0.5rem !important;
        }

        .pr-md-2,
        .px-md-2 {
            padding-right: 0.5rem !important;
        }

        .pb-md-2,
        .py-md-2 {
            padding-bottom: 0.5rem !important;
        }

        .pl-md-2,
        .px-md-2 {
            padding-left: 0.5rem !important;
        }

        .p-md-3 {
            padding: 1rem !important;
        }

        .pt-md-3,
        .py-md-3 {
            padding-top: 1rem !important;
        }

        .pr-md-3,
        .px-md-3 {
            padding-right: 1rem !important;
        }

        .pb-md-3,
        .py-md-3 {
            padding-bottom: 1rem !important;
        }

        .pl-md-3,
        .px-md-3 {
            padding-left: 1rem !important;
        }

        .p-md-4 {
            padding: 1.5rem !important;
        }

        .pt-md-4,
        .py-md-4 {
            padding-top: 1.5rem !important;
        }

        .pr-md-4,
        .px-md-4 {
            padding-right: 1.5rem !important;
        }

        .pb-md-4,
        .py-md-4 {
            padding-bottom: 1.5rem !important;
        }

        .pl-md-4,
        .px-md-4 {
            padding-left: 1.5rem !important;
        }

        .p-md-5 {
            padding: 3rem !important;
        }

        .pt-md-5,
        .py-md-5 {
            padding-top: 3rem !important;
        }

        .pr-md-5,
        .px-md-5 {
            padding-right: 3rem !important;
        }

        .pb-md-5,
        .py-md-5 {
            padding-bottom: 3rem !important;
        }

        .pl-md-5,
        .px-md-5 {
            padding-left: 3rem !important;
        }

        .m-md-auto {
            margin: auto !important;
        }

        .mt-md-auto,
        .my-md-auto {
            margin-top: auto !important;
        }

        .mr-md-auto,
        .mx-md-auto {
            margin-right: auto !important;
        }

        .mb-md-auto,
        .my-md-auto {
            margin-bottom: auto !important;
        }

        .ml-md-auto,
        .mx-md-auto {
            margin-left: auto !important;
        }
    }

    @media (min-width: 992px) {
        .m-lg-0 {
            margin: 0 !important;
        }

        .mt-lg-0,
        .my-lg-0 {
            margin-top: 0 !important;
        }

        .mr-lg-0,
        .mx-lg-0 {
            margin-right: 0 !important;
        }

        .mb-lg-0,
        .my-lg-0 {
            margin-bottom: 0 !important;
        }

        .ml-lg-0,
        .mx-lg-0 {
            margin-left: 0 !important;
        }

        .m-lg-1 {
            margin: 0.25rem !important;
        }

        .mt-lg-1,
        .my-lg-1 {
            margin-top: 0.25rem !important;
        }

        .mr-lg-1,
        .mx-lg-1 {
            margin-right: 0.25rem !important;
        }

        .mb-lg-1,
        .my-lg-1 {
            margin-bottom: 0.25rem !important;
        }

        .ml-lg-1,
        .mx-lg-1 {
            margin-left: 0.25rem !important;
        }

        .m-lg-2 {
            margin: 0.5rem !important;
        }

        .mt-lg-2,
        .my-lg-2 {
            margin-top: 0.5rem !important;
        }

        .mr-lg-2,
        .mx-lg-2 {
            margin-right: 0.5rem !important;
        }

        .mb-lg-2,
        .my-lg-2 {
            margin-bottom: 0.5rem !important;
        }

        .ml-lg-2,
        .mx-lg-2 {
            margin-left: 0.5rem !important;
        }

        .m-lg-3 {
            margin: 1rem !important;
        }

        .mt-lg-3,
        .my-lg-3 {
            margin-top: 1rem !important;
        }

        .mr-lg-3,
        .mx-lg-3 {
            margin-right: 1rem !important;
        }

        .mb-lg-3,
        .my-lg-3 {
            margin-bottom: 1rem !important;
        }

        .ml-lg-3,
        .mx-lg-3 {
            margin-left: 1rem !important;
        }

        .m-lg-4 {
            margin: 1.5rem !important;
        }

        .mt-lg-4,
        .my-lg-4 {
            margin-top: 1.5rem !important;
        }

        .mr-lg-4,
        .mx-lg-4 {
            margin-right: 1.5rem !important;
        }

        .mb-lg-4,
        .my-lg-4 {
            margin-bottom: 1.5rem !important;
        }

        .ml-lg-4,
        .mx-lg-4 {
            margin-left: 1.5rem !important;
        }

        .m-lg-5 {
            margin: 3rem !important;
        }

        .mt-lg-5,
        .my-lg-5 {
            margin-top: 3rem !important;
        }

        .mr-lg-5,
        .mx-lg-5 {
            margin-right: 3rem !important;
        }

        .mb-lg-5,
        .my-lg-5 {
            margin-bottom: 3rem !important;
        }

        .ml-lg-5,
        .mx-lg-5 {
            margin-left: 3rem !important;
        }

        .p-lg-0 {
            padding: 0 !important;
        }

        .pt-lg-0,
        .py-lg-0 {
            padding-top: 0 !important;
        }

        .pr-lg-0,
        .px-lg-0 {
            padding-right: 0 !important;
        }

        .pb-lg-0,
        .py-lg-0 {
            padding-bottom: 0 !important;
        }

        .pl-lg-0,
        .px-lg-0 {
            padding-left: 0 !important;
        }

        .p-lg-1 {
            padding: 0.25rem !important;
        }

        .pt-lg-1,
        .py-lg-1 {
            padding-top: 0.25rem !important;
        }

        .pr-lg-1,
        .px-lg-1 {
            padding-right: 0.25rem !important;
        }

        .pb-lg-1,
        .py-lg-1 {
            padding-bottom: 0.25rem !important;
        }

        .pl-lg-1,
        .px-lg-1 {
            padding-left: 0.25rem !important;
        }

        .p-lg-2 {
            padding: 0.5rem !important;
        }

        .pt-lg-2,
        .py-lg-2 {
            padding-top: 0.5rem !important;
        }

        .pr-lg-2,
        .px-lg-2 {
            padding-right: 0.5rem !important;
        }

        .pb-lg-2,
        .py-lg-2 {
            padding-bottom: 0.5rem !important;
        }

        .pl-lg-2,
        .px-lg-2 {
            padding-left: 0.5rem !important;
        }

        .p-lg-3 {
            padding: 1rem !important;
        }

        .pt-lg-3,
        .py-lg-3 {
            padding-top: 1rem !important;
        }

        .pr-lg-3,
        .px-lg-3 {
            padding-right: 1rem !important;
        }

        .pb-lg-3,
        .py-lg-3 {
            padding-bottom: 1rem !important;
        }

        .pl-lg-3,
        .px-lg-3 {
            padding-left: 1rem !important;
        }

        .p-lg-4 {
            padding: 1.5rem !important;
        }

        .pt-lg-4,
        .py-lg-4 {
            padding-top: 1.5rem !important;
        }

        .pr-lg-4,
        .px-lg-4 {
            padding-right: 1.5rem !important;
        }

        .pb-lg-4,
        .py-lg-4 {
            padding-bottom: 1.5rem !important;
        }

        .pl-lg-4,
        .px-lg-4 {
            padding-left: 1.5rem !important;
        }

        .p-lg-5 {
            padding: 3rem !important;
        }

        .pt-lg-5,
        .py-lg-5 {
            padding-top: 3rem !important;
        }

        .pr-lg-5,
        .px-lg-5 {
            padding-right: 3rem !important;
        }

        .pb-lg-5,
        .py-lg-5 {
            padding-bottom: 3rem !important;
        }

        .pl-lg-5,
        .px-lg-5 {
            padding-left: 3rem !important;
        }

        .m-lg-auto {
            margin: auto !important;
        }

        .mt-lg-auto,
        .my-lg-auto {
            margin-top: auto !important;
        }

        .mr-lg-auto,
        .mx-lg-auto {
            margin-right: auto !important;
        }

        .mb-lg-auto,
        .my-lg-auto {
            margin-bottom: auto !important;
        }

        .ml-lg-auto,
        .mx-lg-auto {
            margin-left: auto !important;
        }
    }

    @media (min-width: 1200px) {
        .m-xl-0 {
            margin: 0 !important;
        }

        .mt-xl-0,
        .my-xl-0 {
            margin-top: 0 !important;
        }

        .mr-xl-0,
        .mx-xl-0 {
            margin-right: 0 !important;
        }

        .mb-xl-0,
        .my-xl-0 {
            margin-bottom: 0 !important;
        }

        .ml-xl-0,
        .mx-xl-0 {
            margin-left: 0 !important;
        }

        .m-xl-1 {
            margin: 0.25rem !important;
        }

        .mt-xl-1,
        .my-xl-1 {
            margin-top: 0.25rem !important;
        }

        .mr-xl-1,
        .mx-xl-1 {
            margin-right: 0.25rem !important;
        }

        .mb-xl-1,
        .my-xl-1 {
            margin-bottom: 0.25rem !important;
        }

        .ml-xl-1,
        .mx-xl-1 {
            margin-left: 0.25rem !important;
        }

        .m-xl-2 {
            margin: 0.5rem !important;
        }

        .mt-xl-2,
        .my-xl-2 {
            margin-top: 0.5rem !important;
        }

        .mr-xl-2,
        .mx-xl-2 {
            margin-right: 0.5rem !important;
        }

        .mb-xl-2,
        .my-xl-2 {
            margin-bottom: 0.5rem !important;
        }

        .ml-xl-2,
        .mx-xl-2 {
            margin-left: 0.5rem !important;
        }

        .m-xl-3 {
            margin: 1rem !important;
        }

        .mt-xl-3,
        .my-xl-3 {
            margin-top: 1rem !important;
        }

        .mr-xl-3,
        .mx-xl-3 {
            margin-right: 1rem !important;
        }

        .mb-xl-3,
        .my-xl-3 {
            margin-bottom: 1rem !important;
        }

        .ml-xl-3,
        .mx-xl-3 {
            margin-left: 1rem !important;
        }

        .m-xl-4 {
            margin: 1.5rem !important;
        }

        .mt-xl-4,
        .my-xl-4 {
            margin-top: 1.5rem !important;
        }

        .mr-xl-4,
        .mx-xl-4 {
            margin-right: 1.5rem !important;
        }

        .mb-xl-4,
        .my-xl-4 {
            margin-bottom: 1.5rem !important;
        }

        .ml-xl-4,
        .mx-xl-4 {
            margin-left: 1.5rem !important;
        }

        .m-xl-5 {
            margin: 3rem !important;
        }

        .mt-xl-5,
        .my-xl-5 {
            margin-top: 3rem !important;
        }

        .mr-xl-5,
        .mx-xl-5 {
            margin-right: 3rem !important;
        }

        .mb-xl-5,
        .my-xl-5 {
            margin-bottom: 3rem !important;
        }

        .ml-xl-5,
        .mx-xl-5 {
            margin-left: 3rem !important;
        }

        .p-xl-0 {
            padding: 0 !important;
        }

        .pt-xl-0,
        .py-xl-0 {
            padding-top: 0 !important;
        }

        .pr-xl-0,
        .px-xl-0 {
            padding-right: 0 !important;
        }

        .pb-xl-0,
        .py-xl-0 {
            padding-bottom: 0 !important;
        }

        .pl-xl-0,
        .px-xl-0 {
            padding-left: 0 !important;
        }

        .p-xl-1 {
            padding: 0.25rem !important;
        }

        .pt-xl-1,
        .py-xl-1 {
            padding-top: 0.25rem !important;
        }

        .pr-xl-1,
        .px-xl-1 {
            padding-right: 0.25rem !important;
        }

        .pb-xl-1,
        .py-xl-1 {
            padding-bottom: 0.25rem !important;
        }

        .pl-xl-1,
        .px-xl-1 {
            padding-left: 0.25rem !important;
        }

        .p-xl-2 {
            padding: 0.5rem !important;
        }

        .pt-xl-2,
        .py-xl-2 {
            padding-top: 0.5rem !important;
        }

        .pr-xl-2,
        .px-xl-2 {
            padding-right: 0.5rem !important;
        }

        .pb-xl-2,
        .py-xl-2 {
            padding-bottom: 0.5rem !important;
        }

        .pl-xl-2,
        .px-xl-2 {
            padding-left: 0.5rem !important;
        }

        .p-xl-3 {
            padding: 1rem !important;
        }

        .pt-xl-3,
        .py-xl-3 {
            padding-top: 1rem !important;
        }

        .pr-xl-3,
        .px-xl-3 {
            padding-right: 1rem !important;
        }

        .pb-xl-3,
        .py-xl-3 {
            padding-bottom: 1rem !important;
        }

        .pl-xl-3,
        .px-xl-3 {
            padding-left: 1rem !important;
        }

        .p-xl-4 {
            padding: 1.5rem !important;
        }

        .pt-xl-4,
        .py-xl-4 {
            padding-top: 1.5rem !important;
        }

        .pr-xl-4,
        .px-xl-4 {
            padding-right: 1.5rem !important;
        }

        .pb-xl-4,
        .py-xl-4 {
            padding-bottom: 1.5rem !important;
        }

        .pl-xl-4,
        .px-xl-4 {
            padding-left: 1.5rem !important;
        }

        .p-xl-5 {
            padding: 3rem !important;
        }

        .pt-xl-5,
        .py-xl-5 {
            padding-top: 3rem !important;
        }

        .pr-xl-5,
        .px-xl-5 {
            padding-right: 3rem !important;
        }

        .pb-xl-5,
        .py-xl-5 {
            padding-bottom: 3rem !important;
        }

        .pl-xl-5,
        .px-xl-5 {
            padding-left: 3rem !important;
        }

        .m-xl-auto {
            margin: auto !important;
        }

        .mt-xl-auto,
        .my-xl-auto {
            margin-top: auto !important;
        }

        .mr-xl-auto,
        .mx-xl-auto {
            margin-right: auto !important;
        }

        .mb-xl-auto,
        .my-xl-auto {
            margin-bottom: auto !important;
        }

        .ml-xl-auto,
        .mx-xl-auto {
            margin-left: auto !important;
        }
    }

    .text-justify {
        text-align: justify !important;
    }

    .text-nowrap {
        white-space: nowrap !important;
    }

    .text-truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .text-left {
        text-align: left !important;
    }

    .text-right {
        text-align: right !important;
    }

    .text-center {
        text-align: center !important;
    }

    @media (min-width: 576px) {
        .text-sm-left {
            text-align: left !important;
        }

        .text-sm-right {
            text-align: right !important;
        }

        .text-sm-center {
            text-align: center !important;
        }
    }

    @media (min-width: 768px) {
        .text-md-left {
            text-align: left !important;
        }

        .text-md-right {
            text-align: right !important;
        }

        .text-md-center {
            text-align: center !important;
        }
    }

    @media (min-width: 992px) {
        .text-lg-left {
            text-align: left !important;
        }

        .text-lg-right {
            text-align: right !important;
        }

        .text-lg-center {
            text-align: center !important;
        }
    }

    @media (min-width: 1200px) {
        .text-xl-left {
            text-align: left !important;
        }

        .text-xl-right {
            text-align: right !important;
        }

        .text-xl-center {
            text-align: center !important;
        }
    }

    .text-lowercase {
        text-transform: lowercase !important;
    }

    .text-uppercase {
        text-transform: uppercase !important;
    }

    .text-capitalize {
        text-transform: capitalize !important;
    }

    .font-weight-light {
        font-weight: 300 !important;
    }

    .font-weight-normal {
        font-weight: 400 !important;
    }

    .font-weight-bold {
        font-weight: 700 !important;
    }

    .font-italic {
        font-style: italic !important;
    }

    .text-white {
        color: #fff !important;
    }

    .text-primary {
        color: #745af2 !important;
    }

    a.text-primary:focus, a.text-primary:hover {
        color: #4c2bee !important;
    }

    .text-secondary {
        color: #cccccc !important;
    }

    a.text-secondary:focus, a.text-secondary:hover {
        color: #b3b2b2 !important;
    }

    .text-success {
        color: #06d79c !important;
    }

    a.text-success:focus, a.text-success:hover {
        color: #05a578 !important;
    }

    .text-info {
        color: #398bf7 !important;
    }

    a.text-info:focus, a.text-info:hover {
        color: #0a6ff3 !important;
    }

    .text-warning {
        color: #ffb22b !important;
    }

    a.text-warning:focus, a.text-warning:hover {
        color: #f79d00 !important;
    }

    .text-danger {
        color: #ef5350 !important;
    }

    a.text-danger:focus, a.text-danger:hover {
        color: #eb2521 !important;
    }

    .text-light {
        color: #e9edf2 !important;
    }

    a.text-light:focus, a.text-light:hover {
        color: #c9d3df !important;
    }

    .text-dark {
        color: #263238 !important;
    }

    a.text-dark:focus, a.text-dark:hover {
        color: #11171a !important;
    }

    .text-muted {
        color: #868e96 !important;
    }

    .text-hide {
        font: 0/0 a;
        color: transparent;
        text-shadow: none;
        background-color: transparent;
        border: 0;
    }

    .visible {
        visibility: visible !important;
    }

    .invisible {
        visibility: hidden !important;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /**
 * Table Of Content
 *
 *  1. Globals
 *  2. Headers
 *  3. Navigations
 *  4. Banners
 *  5. Footers
 *  6. Posts
 *  7. Widgets
 *  8. Custom Templates
 */
    /*******************
Global Styles
*******************/
    * {
        outline: none;
    }

    body {
        background: #fff;
        font-family: "Product Sans", sans-serif;
        margin: 0;
        overflow-x: hidden;
        color: #67757c;
        font-weight: 300;
        font-display: fallback;
    }

    html {
        position: relative;
        min-height: 100%;
        background: #ffffff;
    }

    a:hover,
    a:focus {
        text-decoration: none;
    }

    a {
        color: #398bf7;
    }

    a:hover, a:focus {
        color: #455a64;
    }

    a.link {
        color: #455a64;
    }

    a.link:hover, a.link:focus {
        color: #398bf7;
    }

    .img-responsive {
        width: 100%;
        height: auto;
        display: inline-block;
    }

    .img-rounded {
        border-radius: 4px;
    }

    html body .mdi:before,
    html body .mdi-set {
        line-height: initial;
    }

    /*******************
Headings
*******************/
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        color: #455a64;
        font-family: "Product Sans", sans-serif;
        font-weight: 400;
    }

    h1 {
        line-height: 40px;
        font-size: 36px;
    }

    h2 {
        line-height: 36px;
        font-size: 24px;
    }

    h3 {
        line-height: 30px;
        font-size: 21px;
    }

    h4 {
        line-height: 22px;
        font-size: 18px;
    }

    h5 {
        line-height: 18px;
        font-size: 16px;
        font-weight: 400;
    }

    h6 {
        line-height: 16px;
        font-size: 14px;
        font-weight: 400;
    }

    .display-5 {
        font-size: 3rem !important;
    }

    .display-6 {
        font-size: 36px;
    }

    .box {
        border-radius: 4px;
        padding: 10px;
    }

    html body .dl {
        display: inline-block;
    }

    html body .db {
        display: block;
    }

    .no-wrap td,
    .no-wrap th {
        white-space: nowrap;
    }

    /*******************
Opacity
*******************/
    .op-5 {
        opacity: 0.5;
    }

    .op-3 {
        opacity: 0.3;
    }

    /*******************
Blockquote
*******************/
    html body blockquote {
        border-left: 5px solid #398bf7;
        border: 1px solid rgba(120, 130, 140, 0.13);
        padding: 15px;
    }

    .clear {
        clear: both;
    }

    ol li {
        margin: 5px 0;
    }

    /*******************
Paddings
*******************/
    html body .p-0 {
        padding: 0px;
    }

    html body .p-10 {
        padding: 10px;
    }

    html body .p-20 {
        padding: 20px;
    }

    html body .p-30 {
        padding: 30px;
    }

    html body .p-l-0 {
        padding-left: 0px;
    }

    html body .p-l-10 {
        padding-left: 10px;
    }

    html body .p-l-20 {
        padding-left: 20px;
    }

    html body .p-r-0 {
        padding-right: 0px;
    }

    html body .p-r-10 {
        padding-right: 10px;
    }

    html body .p-r-20 {
        padding-right: 20px;
    }

    html body .p-r-30 {
        padding-right: 30px;
    }

    html body .p-r-40 {
        padding-right: 40px;
    }

    html body .p-t-0 {
        padding-top: 0px;
    }

    html body .p-t-10 {
        padding-top: 10px;
    }

    html body .p-t-20 {
        padding-top: 20px;
    }

    html body .p-t-30 {
        padding-top: 30px;
    }

    html body .p-b-0 {
        padding-bottom: 0px;
    }

    html body .p-b-5 {
        padding-bottom: 5px;
    }

    html body .p-b-10 {
        padding-bottom: 10px;
    }

    html body .p-b-20 {
        padding-bottom: 20px;
    }

    html body .p-b-30 {
        padding-bottom: 30px;
    }

    html body .p-b-40 {
        padding-bottom: 40px;
    }

    /*******************
Margin
*******************/
    html body .m-0 {
        margin: 0px;
    }

    html body .m-l-5 {
        margin-left: 5px;
    }

    html body .m-l-10 {
        margin-left: 10px;
    }

    html body .m-l-15 {
        margin-left: 15px;
    }

    html body .m-l-20 {
        margin-left: 20px;
    }

    html body .m-l-30 {
        margin-left: 30px;
    }

    html body .m-l-40 {
        margin-left: 40px;
    }

    html body .m-r-5 {
        margin-right: 5px;
    }

    html body .m-r-10 {
        margin-right: 10px;
    }

    html body .m-r-15 {
        margin-right: 15px;
    }

    html body .m-r-20 {
        margin-right: 20px;
    }

    html body .m-r-30 {
        margin-right: 30px;
    }

    html body .m-r-40 {
        margin-right: 40px;
    }

    html body .m-t-0 {
        margin-top: 0px;
    }

    html body .m-t-5 {
        margin-top: 5px;
    }

    html body .m-t-10 {
        margin-top: 10px;
    }

    html body .m-t-15 {
        margin-top: 15px;
    }

    html body .m-t-20 {
        margin-top: 20px;
    }

    html body .m-t-30 {
        margin-top: 30px;
    }

    html body .m-t-40 {
        margin-top: 40px;
    }

    html body .m-b-0 {
        margin-bottom: 0px;
    }

    html body .m-b-5 {
        margin-bottom: 5px;
    }

    html body .m-b-10 {
        margin-bottom: 10px;
    }

    html body .m-b-15 {
        margin-bottom: 15px;
    }

    html body .m-b-20 {
        margin-bottom: 20px;
    }

    html body .m-b-30 {
        margin-bottom: 30px;
    }

    html body .m-b-40 {
        margin-bottom: 40px;
    }

    /*******************
vertical alignment
*******************/
    html body .vt {
        vertical-align: top;
    }

    html body .vm {
        vertical-align: middle;
    }

    html body .vb {
        vertical-align: bottom;
    }

    /*******************
Opacity
*******************/
    .op-5 {
        opacity: 0.5;
    }

    /*******************
font weight
*******************/
    html body .font-bold {
        font-weight: 700;
    }

    html body .font-normal {
        font-weight: normal;
    }

    html body .font-light {
        font-weight: 300;
    }

    html body .font-medium {
        font-weight: 500;
    }

    html body .font-16 {
        font-size: 16px;
    }

    html body .font-14 {
        font-size: 14px;
    }

    html body .font-10 {
        font-size: 10px;
    }

    html body .font-18 {
        font-size: 18px;
    }

    html body .font-20 {
        font-size: 20px;
    }

    /*******************
Border
*******************/
    html body .b-0 {
        border: none;
    }

    html body .b-r {
        border-right: 1px solid rgba(120, 130, 140, 0.13);
    }

    html body .b-l {
        border-left: 1px solid rgba(120, 130, 140, 0.13);
    }

    html body .b-b {
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
    }

    html body .b-t {
        border-top: 1px solid rgba(120, 130, 140, 0.13);
    }

    html body .b-all {
        border: 1px solid rgba(120, 130, 140, 0.13) !important;
    }

    /*******************
Thumb size
*******************/
    .thumb-sm {
        height: 32px;
        width: 32px;
    }

    .thumb-md {
        height: 48px;
        width: 48px;
    }

    .thumb-lg {
        height: 88px;
        width: 88px;
    }

    .hide {
        display: none;
    }

    .img-circle {
        border-radius: 100%;
    }

    .radius {
        border-radius: 4px;
    }

    /*******************
Text Colors
*******************/
    .text-white {
        color: #ffffff !important;
    }

    .text-danger {
        color: #ef5350 !important;
    }

    .text-muted {
        color: #99abb4 !important;
    }

    .text-warning {
        color: #ffb22b !important;
    }

    .text-success {
        color: #06d79c !important;
    }

    .text-info {
        color: #398bf7 !important;
    }

    .text-inverse {
        color: #2f3d4a !important;
    }

    html body .text-blue {
        color: #02bec9;
    }

    html body .text-purple {
        color: #7460ee;
    }

    html body .text-primary {
        color: #745af2;
    }

    html body .text-megna {
        color: #56c0d8;
    }

    html body .text-dark {
        color: #67757c;
    }

    html body .text-themecolor {
        color: #398bf7;
    }

    /*******************
Background Colors
*******************/
    .bg-primary {
        background-color: #745af2 !important;
    }

    .bg-success {
        background-color: #06d79c !important;
    }

    .bg-info {
        background-color: #398bf7 !important;
    }

    .bg-warning {
        background-color: #ffb22b !important;
    }

    .bg-danger {
        background-color: #ef5350 !important;
    }

    html body .bg-megna {
        background-color: #56c0d8;
    }

    html body .bg-theme {
        background-color: #398bf7;
    }

    html body .bg-inverse {
        background-color: #2f3d4a;
    }

    html body .bg-purple {
        background-color: #7460ee;
    }

    html body .bg-light-part {
        background-color: rgba(0, 0, 0, 0.02);
    }

    html body .bg-light-primary {
        background-color: #f1effd;
    }

    html body .bg-light-success {
        background-color: #e8fdeb;
    }

    html body .bg-light-info {
        background-color: #cfecfe;
    }

    html body .bg-light-extra {
        background-color: #ebf3f5;
    }

    html body .bg-light-warning {
        background-color: #fff8ec;
    }

    html body .bg-light-danger {
        background-color: #f9e7eb;
    }

    html body .bg-light-inverse {
        background-color: #f6f6f6;
    }

    html body .bg-light {
        background-color: #e9edf2;
    }

    html body .bg-white {
        background-color: #ffffff;
    }

    /*******************
Rounds
*******************/
    .round {
        line-height: 48px;
        color: #ffffff;
        width: 50px;
        height: 50px;
        display: inline-block;
        font-weight: 400;
        text-align: center;
        border-radius: 100%;
        background: #398bf7;
    }

    .round img {
        border-radius: 100%;
    }

    .round-lg {
        line-height: 65px;
        width: 60px;
        height: 60px;
        font-size: 30px;
    }

    .round.round-info {
        background: #398bf7;
    }

    .round.round-warning {
        background: #ffb22b;
    }

    .round.round-danger {
        background: #ef5350;
    }

    .round.round-success {
        background: #06d79c;
    }

    .round.round-primary {
        background: #745af2;
    }

    /*******************
Labels
*******************/
    .label {
        padding: 3px 10px;
        line-height: 13px;
        color: #ffffff;
        font-weight: 400;
        border-radius: 4px;
        font-size: 75%;
    }

    .label-rounded {
        border-radius: 60px;
    }

    .label-custom {
        background-color: #56c0d8;
    }

    .label-success {
        background-color: #06d79c;
    }

    .label-info {
        background-color: #398bf7;
    }

    .label-warning {
        background-color: #ffb22b;
    }

    .label-danger {
        background-color: #ef5350;
    }

    .label-megna {
        background-color: #56c0d8;
    }

    .label-primary {
        background-color: #745af2;
    }

    .label-purple {
        background-color: #7460ee;
    }

    .label-red {
        background-color: #fb3a3a;
    }

    .label-inverse {
        background-color: #2f3d4a;
    }

    .label-default {
        background-color: #e9edf2;
    }

    .label-white {
        background-color: #ffffff;
    }

    .label-light-success {
        background-color: #e8fdeb;
        color: #06d79c;
    }

    .label-light-info {
        background-color: #cfecfe;
        color: #398bf7;
    }

    .label-light-warning {
        background-color: #fff8ec;
        color: #ffb22b;
    }

    .label-light-danger {
        background-color: #f9e7eb;
        color: #ef5350;
    }

    .label-light-megna {
        background-color: #e0f2f4;
        color: #56c0d8;
    }

    .label-light-primary {
        background-color: #f1effd;
        color: #745af2;
    }

    .label-light-inverse {
        background-color: #f6f6f6;
        color: #2f3d4a;
    }

    /*******************
Pagination
*******************/
    .pagination > li:first-child > a,
    .pagination > li:first-child > span {
        border-bottom-left-radius: 4px;
        border-top-left-radius: 4px;
    }

    .pagination > li:last-child > a,
    .pagination > li:last-child > span {
        border-bottom-right-radius: 4px;
        border-top-right-radius: 4px;
    }

    .pagination > li > a,
    .pagination > li > span {
        color: #263238;
    }

    .pagination > li > a:hover,
    .pagination > li > span:hover,
    .pagination > li > a:focus,
    .pagination > li > span:focus {
        background-color: #e9edf2;
    }

    .pagination-split li {
        margin-left: 5px;
        display: inline-block;
        float: left;
    }

    .pagination-split li:first-child {
        margin-left: 0;
    }

    .pagination-split li a {
        border-radius: 4px;
    }

    .pagination > .active > a,
    .pagination > .active > span,
    .pagination > .active > a:hover,
    .pagination > .active > span:hover,
    .pagination > .active > a:focus,
    .pagination > .active > span:focus {
        background-color: #398bf7;
        border-color: #398bf7;
    }

    .pager li > a,
    .pager li > span {
        border-radius: 4px;
        color: #263238;
    }

    /*******************
Table Cell
*******************/
    .table-box {
        display: table;
        width: 100%;
    }

    .table.no-border tbody td {
        border: 0px;
    }

    .cell {
        display: table-cell;
        vertical-align: middle;
    }

    .table td,
    .table th {
        border-color: #f3f1f1;
    }

    .table thead th,
    .table th {
        font-weight: 500;
    }

    .table-hover tbody tr:hover {
        background: #e9edf2;
    }

    .nowrap {
        white-space: nowrap;
    }

    .lite-padding td {
        padding: 5px;
    }

    .v-middle td,
    .v-middle th {
        vertical-align: middle;
    }

    .table-responsive {
        display: block;
        width: 100%;
        overflow-x: auto;
        -ms-overflow-style: -ms-autohiding-scrollbar;
    }

    /*******************
Wave Effects
*******************/
    .waves-effect {
        position: relative;
        cursor: pointer;
        display: inline-block;
        overflow: hidden;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        vertical-align: middle;
        z-index: 1;
        will-change: opacity, transform;
        transition: all 0.1s ease-out;
    }

    .waves-effect .waves-ripple {
        position: absolute;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        margin-top: -10px;
        margin-left: -10px;
        opacity: 0;
        background: rgba(0, 0, 0, 0.2);
        transition: all 0.7s ease-out;
        transition-property: opacity, -webkit-transform;
        transition-property: transform, opacity;
        transition-property: transform, opacity, -webkit-transform;
        -webkit-transform: scale(0);
        transform: scale(0);
        pointer-events: none;
    }

    .waves-effect.waves-light .waves-ripple {
        background-color: rgba(255, 255, 255, 0.45);
    }

    .waves-effect.waves-red .waves-ripple {
        background-color: rgba(244, 67, 54, 0.7);
    }

    .waves-effect.waves-yellow .waves-ripple {
        background-color: rgba(255, 235, 59, 0.7);
    }

    .waves-effect.waves-orange .waves-ripple {
        background-color: rgba(255, 152, 0, 0.7);
    }

    .waves-effect.waves-purple .waves-ripple {
        background-color: rgba(156, 39, 176, 0.7);
    }

    .waves-effect.waves-green .waves-ripple {
        background-color: rgba(76, 175, 80, 0.7);
    }

    .waves-effect.waves-teal .waves-ripple {
        background-color: rgba(0, 150, 136, 0.7);
    }

    html body .waves-notransition {
        transition: none;
    }

    .waves-circle {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        text-align: center;
        width: 2.5em;
        height: 2.5em;
        line-height: 2.5em;
        border-radius: 50%;
        -webkit-mask-image: none;
    }

    .waves-input-wrapper {
        border-radius: 0.2em;
        vertical-align: bottom;
    }

    .waves-input-wrapper .waves-button-input {
        position: relative;
        top: 0;
        left: 0;
        z-index: 1;
    }

    .waves-block {
        display: block;
    }

    /*Badge*/
    .badge {
        font-weight: 400;
    }

    .badge-xs {
        font-size: 9px;
    }

    .badge-xs,
    .badge-sm {
        -webkit-transform: translate(0, -2px);
        transform: translate(0, -2px);
    }

    .badge-success {
        background-color: #06d79c;
    }

    .badge-info {
        background-color: #398bf7;
    }

    .badge-primary {
        background-color: #745af2;
    }

    .badge-warning {
        background-color: #ffb22b;
    }

    .badge-danger {
        background-color: #ef5350;
    }

    .badge-purple {
        background-color: #7460ee;
    }

    .badge-red {
        background-color: #fb3a3a;
    }

    .badge-inverse {
        background-color: #2f3d4a;
    }

    /*******************
Buttons
******************/
    .btn {
        padding: 7px 12px;
        cursor: pointer;
    }

    .btn-group label {
        color: #ffffff !important;
        margin-bottom: 0px;
    }

    .btn-group label.btn-secondary {
        color: #67757c !important;
    }

    .btn-lg, .btn-group-lg > .btn {
        padding: .75rem 1.5rem;
        font-size: 1.25rem;
    }

    .btn-md {
        padding: 12px 55px;
        font-size: 16px;
    }

    .btn-circle {
        border-radius: 100%;
        width: 40px;
        height: 40px;
        padding: 10px;
    }

    .btn-circle.btn-sm, .btn-group-sm > .btn-circle.btn {
        width: 35px;
        height: 35px;
        padding: 8px 10px;
        font-size: 14px;
    }

    .btn-circle.btn-lg, .btn-group-lg > .btn-circle.btn {
        width: 50px;
        height: 50px;
        padding: 14px 15px;
        font-size: 18px;
        line-height: 22px;
    }

    .btn-circle.btn-xl {
        width: 70px;
        height: 70px;
        padding: 14px 15px;
        font-size: 24px;
    }

    .btn-sm, .btn-group-sm > .btn {
        padding: .25rem .5rem;
        font-size: 12px;
    }

    .btn-xs {
        padding: .25rem .5rem;
        font-size: 10px;
    }

    .button-list button,
    .button-list a {
        margin: 5px 12px 5px 0;
    }

    .btn-outline {
        color: inherit;
        background-color: transparent;
        transition: all .5s;
    }

    .btn-rounded {
        border-radius: 60px;
        padding: 7px 18px;
    }

    .btn-rounded.btn-lg, .btn-group-lg > .btn-rounded.btn {
        padding: .75rem 1.5rem;
    }

    .btn-rounded.btn-sm, .btn-group-sm > .btn-rounded.btn {
        padding: .25rem .5rem;
        font-size: 12px;
    }

    .btn-rounded.btn-xs {
        padding: .25rem .5rem;
        font-size: 10px;
    }

    .btn-rounded.btn-md {
        padding: 12px 35px;
        font-size: 16px;
    }

    .btn-secondary,
    .btn-secondary.disabled {
        box-shadow: 0 2px 2px 0 rgba(169, 169, 169, 0.14), 0 3px 1px -2px rgba(169, 169, 169, 0.2), 0 1px 5px 0 rgba(169, 169, 169, 0.12);
        transition: 0.2s ease-in;
        background-color: #ffffff;
        color: #67757c;
        border-color: #b1b8bb;
    }

    .btn-secondary:hover,
    .btn-secondary.disabled:hover {
        box-shadow: 0 14px 26px -12px rgba(169, 169, 169, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(169, 169, 169, 0.2);
    }

    .btn-secondary.active, .btn-secondary:active, .btn-secondary:focus,
    .btn-secondary.disabled.active,
    .btn-secondary.disabled:active,
    .btn-secondary.disabled:focus {
        box-shadow: 0 14px 26px -12px rgba(169, 169, 169, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(169, 169, 169, 0.2);
    }

    .btn-primary,
    .btn-primary.disabled {
        background: #745af2;
        border: 1px solid #745af2;
        box-shadow: 0 2px 2px 0 rgba(116, 96, 238, 0.14), 0 3px 1px -2px rgba(116, 96, 238, 0.2), 0 1px 5px 0 rgba(116, 96, 238, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-primary:hover,
    .btn-primary.disabled:hover {
        background: #745af2;
        box-shadow: 0 14px 26px -12px rgba(116, 96, 238, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(116, 96, 238, 0.2);
        border: 1px solid #745af2;
    }

    .btn-primary.active, .btn-primary:active, .btn-primary:focus,
    .btn-primary.disabled.active,
    .btn-primary.disabled:active,
    .btn-primary.disabled:focus {
        background: #6352ce;
        box-shadow: 0 14px 26px -12px rgba(116, 96, 238, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(116, 96, 238, 0.2);
    }

    .btn-themecolor,
    .btn-themecolor.disabled {
        background: #398bf7;
        color: #ffffff;
        border: 1px solid #398bf7;
    }

    .btn-themecolor:hover,
    .btn-themecolor.disabled:hover {
        background: #398bf7;
        opacity: 0.7;
        border: 1px solid #398bf7;
    }

    .btn-themecolor.active, .btn-themecolor:active, .btn-themecolor:focus,
    .btn-themecolor.disabled.active,
    .btn-themecolor.disabled:active,
    .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .btn-success,
    .btn-success.disabled {
        background: #06d79c;
        border: 1px solid #06d79c;
        box-shadow: 0 2px 2px 0 rgba(40, 190, 189, 0.14), 0 3px 1px -2px rgba(40, 190, 189, 0.2), 0 1px 5px 0 rgba(40, 190, 189, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-success:hover,
    .btn-success.disabled:hover {
        background: #06d79c;
        box-shadow: 0 14px 26px -12px rgba(40, 190, 189, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(40, 190, 189, 0.2);
        border: 1px solid #06d79c;
    }

    .btn-success.active, .btn-success:active, .btn-success:focus,
    .btn-success.disabled.active,
    .btn-success.disabled:active,
    .btn-success.disabled:focus {
        background: #04b381;
        box-shadow: 0 14px 26px -12px rgba(40, 190, 189, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(40, 190, 189, 0.2);
    }

    .btn-info,
    .btn-info.disabled {
        background: #398bf7;
        border: 1px solid #398bf7;
        box-shadow: 0 2px 2px 0 rgba(66, 165, 245, 0.14), 0 3px 1px -2px rgba(66, 165, 245, 0.2), 0 1px 5px 0 rgba(66, 165, 245, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-info:hover,
    .btn-info.disabled:hover {
        background: #398bf7;
        border: 1px solid #398bf7;
        box-shadow: 0 14px 26px -12px rgba(23, 105, 255, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(23, 105, 255, 0.2);
    }

    .btn-info.active, .btn-info:active, .btn-info:focus,
    .btn-info.disabled.active,
    .btn-info.disabled:active,
    .btn-info.disabled:focus {
        background: #028ee1;
        box-shadow: 0 14px 26px -12px rgba(23, 105, 255, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(23, 105, 255, 0.2);
    }

    .btn-warning,
    .btn-warning.disabled {
        background: #ffb22b;
        color: #ffffff;
        box-shadow: 0 2px 2px 0 rgba(248, 194, 0, 0.14), 0 3px 1px -2px rgba(248, 194, 0, 0.2), 0 1px 5px 0 rgba(248, 194, 0, 0.12);
        border: 1px solid #ffb22b;
        transition: 0.2s ease-in;
        color: #ffffff;
    }

    .btn-warning:hover,
    .btn-warning.disabled:hover {
        background: #ffb22b;
        color: #ffffff;
        box-shadow: 0 14px 26px -12px rgba(248, 194, 0, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(248, 194, 0, 0.2);
        border: 1px solid #ffb22b;
    }

    .btn-warning.active, .btn-warning:active, .btn-warning:focus,
    .btn-warning.disabled.active,
    .btn-warning.disabled:active,
    .btn-warning.disabled:focus {
        background: #e9ab2e;
        color: #ffffff;
        box-shadow: 0 14px 26px -12px rgba(248, 194, 0, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(248, 194, 0, 0.2);
    }

    .btn-danger,
    .btn-danger.disabled {
        background: #ef5350;
        border: 1px solid #ef5350;
        box-shadow: 0 2px 2px 0 rgba(239, 83, 80, 0.14), 0 3px 1px -2px rgba(239, 83, 80, 0.2), 0 1px 5px 0 rgba(239, 83, 80, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-danger:hover,
    .btn-danger.disabled:hover {
        background: #ef5350;
        box-shadow: 0 14px 26px -12px rgba(239, 83, 80, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(239, 83, 80, 0.2);
        border: 1px solid #ef5350;
    }

    .btn-danger.active, .btn-danger:active, .btn-danger:focus,
    .btn-danger.disabled.active,
    .btn-danger.disabled:active,
    .btn-danger.disabled:focus {
        background: #e6294b;
        box-shadow: 0 14px 26px -12px rgba(239, 83, 80, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(239, 83, 80, 0.2);
    }

    .btn-inverse,
    .btn-inverse.disabled {
        background: #2f3d4a;
        border: 1px solid #2f3d4a;
        color: #ffffff;
    }

    .btn-inverse:hover,
    .btn-inverse.disabled:hover {
        background: #2f3d4a;
        opacity: 0.7;
        color: #ffffff;
        border: 1px solid #2f3d4a;
    }

    .btn-inverse.active, .btn-inverse:active, .btn-inverse:focus,
    .btn-inverse.disabled.active,
    .btn-inverse.disabled:active,
    .btn-inverse.disabled:focus {
        background: #232a37;
        color: #ffffff;
    }

    .btn-red,
    .btn-red.disabled {
        background: #fb3a3a;
        border: 1px solid #fb3a3a;
        color: #ffffff;
    }

    .btn-red:hover,
    .btn-red.disabled:hover {
        opacity: 0.7;
        border: 1px solid #fb3a3a;
        background: #fb3a3a;
    }

    .btn-red.active, .btn-red:active, .btn-red:focus,
    .btn-red.disabled.active,
    .btn-red.disabled:active,
    .btn-red.disabled:focus {
        background: #e6294b;
    }

    .btn-outline-secondary {
        background-color: #ffffff;
        box-shadow: 0 2px 2px 0 rgba(169, 169, 169, 0.14), 0 3px 1px -2px rgba(169, 169, 169, 0.2), 0 1px 5px 0 rgba(169, 169, 169, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-outline-secondary:hover, .btn-outline-secondary:focus, .btn-outline-secondary.focus {
        box-shadow: 0 14px 26px -12px rgba(169, 169, 169, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(169, 169, 169, 0.2);
    }

    .btn-outline-secondary.active, .btn-outline-secondary:active, .btn-outline-secondary:focus {
        box-shadow: 0 14px 26px -12px rgba(169, 169, 169, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(169, 169, 169, 0.2);
    }

    .btn-outline-primary {
        color: #745af2;
        background-color: #ffffff;
        border-color: #745af2;
        box-shadow: 0 2px 2px 0 rgba(116, 96, 238, 0.14), 0 3px 1px -2px rgba(116, 96, 238, 0.2), 0 1px 5px 0 rgba(116, 96, 238, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary.focus {
        background: #745af2;
        box-shadow: 0 14px 26px -12px rgba(116, 96, 238, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(116, 96, 238, 0.2);
        color: #ffffff;
        border-color: #745af2;
    }

    .btn-outline-primary.active, .btn-outline-primary:active, .btn-outline-primary:focus {
        box-shadow: 0 14px 26px -12px rgba(116, 96, 238, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(116, 96, 238, 0.2);
        background: #6352ce;
    }

    .btn-outline-success {
        color: #06d79c;
        background-color: transparent;
        border-color: #06d79c;
        box-shadow: 0 2px 2px 0 rgba(40, 190, 189, 0.14), 0 3px 1px -2px rgba(40, 190, 189, 0.2), 0 1px 5px 0 rgba(40, 190, 189, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-outline-success:hover, .btn-outline-success:focus, .btn-outline-success.focus {
        background: #06d79c;
        border-color: #06d79c;
        color: #ffffff;
        box-shadow: 0 14px 26px -12px rgba(40, 190, 189, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(40, 190, 189, 0.2);
    }

    .btn-outline-success.active, .btn-outline-success:active, .btn-outline-success:focus {
        box-shadow: 0 14px 26px -12px rgba(40, 190, 189, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(40, 190, 189, 0.2);
        background: #04b381;
    }

    .btn-outline-info {
        color: #398bf7;
        background-color: transparent;
        border-color: #398bf7;
        box-shadow: 0 2px 2px 0 rgba(66, 165, 245, 0.14), 0 3px 1px -2px rgba(66, 165, 245, 0.2), 0 1px 5px 0 rgba(66, 165, 245, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-outline-info:hover, .btn-outline-info:focus, .btn-outline-info.focus {
        background: #398bf7;
        border-color: #398bf7;
        color: #ffffff;
        box-shadow: 0 14px 26px -12px rgba(23, 105, 255, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(23, 105, 255, 0.2);
    }

    .btn-outline-info.active, .btn-outline-info:active, .btn-outline-info:focus {
        box-shadow: 0 14px 26px -12px rgba(23, 105, 255, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(23, 105, 255, 0.2);
        background: #028ee1;
    }

    .btn-outline-warning {
        color: #ffb22b;
        background-color: transparent;
        border-color: #ffb22b;
        box-shadow: 0 2px 2px 0 rgba(248, 194, 0, 0.14), 0 3px 1px -2px rgba(248, 194, 0, 0.2), 0 1px 5px 0 rgba(248, 194, 0, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-outline-warning:hover, .btn-outline-warning:focus, .btn-outline-warning.focus {
        background: #ffb22b;
        border-color: #ffb22b;
        color: #ffffff;
        box-shadow: 0 14px 26px -12px rgba(248, 194, 0, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(248, 194, 0, 0.2);
    }

    .btn-outline-warning.active, .btn-outline-warning:active, .btn-outline-warning:focus {
        box-shadow: 0 14px 26px -12px rgba(248, 194, 0, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(248, 194, 0, 0.2);
        background: #e9ab2e;
    }

    .btn-outline-danger {
        color: #ef5350;
        background-color: transparent;
        border-color: #ef5350;
        box-shadow: 0 2px 2px 0 rgba(239, 83, 80, 0.14), 0 3px 1px -2px rgba(239, 83, 80, 0.2), 0 1px 5px 0 rgba(239, 83, 80, 0.12);
        transition: 0.2s ease-in;
    }

    .btn-outline-danger:hover, .btn-outline-danger:focus, .btn-outline-danger.focus {
        background: #ef5350;
        border-color: #ef5350;
        color: #ffffff;
        box-shadow: 0 14px 26px -12px rgba(239, 83, 80, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(239, 83, 80, 0.2);
    }

    .btn-outline-danger.active, .btn-outline-danger:active, .btn-outline-danger:focus {
        box-shadow: 0 14px 26px -12px rgba(239, 83, 80, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(239, 83, 80, 0.2);
        background: #e6294b;
    }

    .btn-outline-red {
        color: #fb3a3a;
        background-color: transparent;
        border-color: #fb3a3a;
    }

    .btn-outline-red:hover, .btn-outline-red:focus, .btn-outline-red.focus {
        background: #fb3a3a;
        border-color: #fb3a3a;
        color: #ffffff;
        box-shadow: 0 14px 26px -12px rgba(239, 83, 80, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(239, 83, 80, 0.2);
    }

    .btn-outline-red.active, .btn-outline-red:active, .btn-outline-red:focus {
        box-shadow: 0 14px 26px -12px rgba(239, 83, 80, 0.42), 0 4px 23px 0 rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(239, 83, 80, 0.2);
        background: #e6294b;
    }

    .btn-outline-inverse {
        color: #2f3d4a;
        background-color: transparent;
        border-color: #2f3d4a;
    }

    .btn-outline-inverse:hover, .btn-outline-inverse:focus, .btn-outline-inverse.focus {
        background: #2f3d4a;
        border-color: #2f3d4a;
        color: #ffffff;
    }

    .btn-primary.active.focus,
    .btn-primary.active:focus,
    .btn-primary.active:hover,
    .btn-primary.focus:active,
    .btn-primary:active:focus,
    .btn-primary:active:hover,
    .open > .dropdown-toggle.btn-primary.focus,
    .open > .dropdown-toggle.btn-primary:focus,
    .open > .dropdown-toggle.btn-primary:hover,
    .btn-primary.focus,
    .btn-primary:focus {
        background-color: #6352ce;
        border: 1px solid #6352ce;
    }

    .btn-success.active.focus,
    .btn-success.active:focus,
    .btn-success.active:hover,
    .btn-success.focus:active,
    .btn-success:active:focus,
    .btn-success:active:hover,
    .open > .dropdown-toggle.btn-success.focus,
    .open > .dropdown-toggle.btn-success:focus,
    .open > .dropdown-toggle.btn-success:hover,
    .btn-success.focus,
    .btn-success:focus {
        background-color: #04b381;
        border: 1px solid #04b381;
    }

    .btn-info.active.focus,
    .btn-info.active:focus,
    .btn-info.active:hover,
    .btn-info.focus:active,
    .btn-info:active:focus,
    .btn-info:active:hover,
    .open > .dropdown-toggle.btn-info.focus,
    .open > .dropdown-toggle.btn-info:focus,
    .open > .dropdown-toggle.btn-info:hover,
    .btn-info.focus,
    .btn-info:focus {
        background-color: #028ee1;
        border: 1px solid #028ee1;
    }

    .btn-warning.active.focus,
    .btn-warning.active:focus,
    .btn-warning.active:hover,
    .btn-warning.focus:active,
    .btn-warning:active:focus,
    .btn-warning:active:hover,
    .open > .dropdown-toggle.btn-warning.focus,
    .open > .dropdown-toggle.btn-warning:focus,
    .open > .dropdown-toggle.btn-warning:hover,
    .btn-warning.focus,
    .btn-warning:focus {
        background-color: #e9ab2e;
        border: 1px solid #e9ab2e;
    }

    .btn-danger.active.focus,
    .btn-danger.active:focus,
    .btn-danger.active:hover,
    .btn-danger.focus:active,
    .btn-danger:active:focus,
    .btn-danger:active:hover,
    .open > .dropdown-toggle.btn-danger.focus,
    .open > .dropdown-toggle.btn-danger:focus,
    .open > .dropdown-toggle.btn-danger:hover,
    .btn-danger.focus,
    .btn-danger:focus {
        background-color: #e6294b;
        border: 1px solid #e6294b;
    }

    .btn-inverse:hover,
    .btn-inverse:focus,
    .btn-inverse:active,
    .btn-inverse.active,
    .btn-inverse.focus,
    .btn-inverse:active,
    .btn-inverse:focus,
    .btn-inverse:hover,
    .open > .dropdown-toggle.btn-inverse {
        background-color: #232a37;
        border: 1px solid #232a37;
    }

    .btn-red:hover,
    .btn-red:focus,
    .btn-red:active,
    .btn-red.active,
    .btn-red.focus,
    .btn-red:active,
    .btn-red:focus,
    .btn-red:hover,
    .open > .dropdown-toggle.btn-red {
        background-color: #d61f1f;
        border: 1px solid #d61f1f;
        color: #ffffff;
    }

    .button-box .btn {
        margin: 0 8px 8px 0px;
    }

    .btn-label {
        background: rgba(0, 0, 0, 0.05);
        display: inline-block;
        margin: -6px 12px -6px -14px;
        padding: 7px 15px;
    }

    .btn-facebook {
        color: #ffffff;
        background-color: #3b5998;
    }

    .btn-twitter {
        color: #ffffff;
        background-color: #55acee;
    }

    .btn-linkedin {
        color: #ffffff;
        background-color: #007bb6;
    }

    .btn-dribbble {
        color: #ffffff;
        background-color: #ea4c89;
    }

    .btn-googleplus {
        color: #ffffff;
        background-color: #dd4b39;
    }

    .btn-instagram {
        color: #ffffff;
        background-color: #3f729b;
    }

    .btn-pinterest {
        color: #ffffff;
        background-color: #cb2027;
    }

    .btn-dropbox {
        color: #ffffff;
        background-color: #007ee5;
    }

    .btn-flickr {
        color: #ffffff;
        background-color: #ff0084;
    }

    .btn-tumblr {
        color: #ffffff;
        background-color: #32506d;
    }

    .btn-skype {
        color: #ffffff;
        background-color: #00aff0;
    }

    .btn-youtube {
        color: #ffffff;
        background-color: #bb0000;
    }

    .btn-github {
        color: #ffffff;
        background-color: #171515;
    }

    /*******************
Notify
*******************/
    .notify {
        position: relative;
        top: -22px;
        right: -9px;
    }

    .notify .heartbit {
        position: absolute;
        top: -20px;
        right: -4px;
        height: 25px;
        width: 25px;
        z-index: 10;
        border: 5px solid #ef5350;
        border-radius: 70px;
        -moz-animation: heartbit 1s ease-out;
        -moz-animation-iteration-count: infinite;
        -o-animation: heartbit 1s ease-out;
        -o-animation-iteration-count: infinite;
        -webkit-animation: heartbit 1s ease-out;
        -webkit-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
    }

    .notify .point {
        width: 6px;
        height: 6px;
        border-radius: 30px;
        background-color: #ef5350;
        position: absolute;
        right: 6px;
        top: -10px;
    }

    @-webkit-keyframes heartbit {
        0% {
            -webkit-transform: scale(0);
            opacity: 0.0;
        }
        25% {
            -webkit-transform: scale(0.1);
            opacity: 0.1;
        }
        50% {
            -webkit-transform: scale(0.5);
            opacity: 0.3;
        }
        75% {
            -webkit-transform: scale(0.8);
            opacity: 0.5;
        }
        100% {
            -webkit-transform: scale(1);
            opacity: 0.0;
        }
    }

    /*******************
File Upload
******************/
    .fileupload {
        overflow: hidden;
        position: relative;
    }

    .fileupload input.upload {
        cursor: pointer;
        filter: alpha(opacity=0);
        font-size: 20px;
        margin: 0;
        opacity: 0;
        padding: 0;
        position: absolute;
        right: 0;
        top: 0;
    }

    /*******************
Megamenu
******************/
    .mega-dropdown {
        position: static !important;
        width: 100%;
    }

    .mega-dropdown .dropdown-menu {
        width: 100%;
        padding: 30px;
        margin-top: 0px;
        left: 0px !important;
    }

    .mega-dropdown ul {
        padding: 0px;
    }

    .mega-dropdown ul li {
        list-style: none;
    }

    .mega-dropdown .carousel-item .container {
        padding: 0px;
    }

    .mega-dropdown .nav-accordion .card {
        margin-bottom: 1px;
    }

    .mega-dropdown .nav-accordion .card-header {
        background: #ffffff;
    }

    .mega-dropdown .nav-accordion .card-header h5 {
        margin: 0px;
    }

    .mega-dropdown .nav-accordion .card-header h5 a {
        text-decoration: none;
        color: #67757c;
    }

    /*******************
List-style-none
******************/
    ul.list-style-none {
        margin: 0px;
        padding: 0px;
    }

    ul.list-style-none li {
        list-style: none;
    }

    ul.list-style-none li a {
        color: #67757c;
        padding: 8px 0px;
        display: block;
        text-decoration: none;
    }

    ul.list-style-none li a:hover {
        color: #398bf7;
    }

    /*******************
dropdown-item
******************/
    .dropdown-item {
        padding: 8px 1rem;
        color: #67757c;
    }

    /*******************
Custom-select
******************/
    .custom-select {
        background: url(custom-select.33d0b67c047e466b46c4.png) right 0.75rem center no-repeat;
    }

    /*******************
textarea
******************/
    textarea {
        resize: none;
    }

    /*******************
Form-control
******************/
    .form-control {
        color: #67757c;
        min-height: 38px;
        display: initial;
    }

    .form-control-sm, .input-group-sm > .form-control,
    .input-group-sm > .input-group-addon,
    .input-group-sm > .input-group-btn > .btn {
        min-height: 20px;
    }

    .form-control:disabled,
    .form-control[readonly] {
        opacity: 0.7;
    }

    .custom-control-input:focus ~ .custom-control-indicator {
        box-shadow: none;
    }

    .custom-control-input:checked ~ .custom-control-indicator {
        background-color: #06d79c;
    }

    form label {
        font-weight: 400;
    }

    .form-group {
        margin-bottom: 25px;
    }

    .form-horizontal label {
        margin-bottom: 0px;
    }

    .form-control-static {
        padding-top: 0px;
    }

    .form-bordered .form-group {
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
        padding-bottom: 20px;
    }

    /*******************
Layouts
*****************/
    /*Card-noborders*/
    .card-no-border .card {
        border: 0px;
        border-radius: 4px;
        box-shadow: none;
    }

    .card-no-border .shadow-none {
        box-shadow: none;
    }

    .card-outline-danger,
    .card-outline-info,
    .card-outline-warning,
    .card-outline-success,
    .card-outline-primary {
        background: #ffffff;
    }

    .card-fullscreen {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        z-index: 9999;
        overflow: auto;
    }

    /*******************/
    /*widgets -app*/
    /*******************/
    .css-bar:after {
        z-index: 1;
    }

    .css-bar > i {
        z-index: 10;
    }

    /*******************/
    /*single column*/
    /*******************/
    .single-column .left-sidebar {
        display: none;
    }

    .single-column .page-wrapper {
        margin-left: 0px;
    }

    .fix-width {
        width: 100%;
        max-width: 1170px;
        margin: 0 auto;
    }

    /*******************/
    /*card-default*/
    /*******************/
    .card-default .card-header {
        background: #ffffff;
        border-bottom: 0px;
    }

    /*******************/
    /*pace-js*/
    /*******************/
    .pace {
        -webkit-pointer-events: none;
        pointer-events: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .pace-inactive {
        display: none;
    }

    .pace .pace-progress {
        background: #ef5350;
        position: fixed;
        z-index: 2000;
        top: 0;
        right: 100%;
        width: 100%;
        height: 2px;
    }

    .progress {
        height: auto;
        min-height: 6px;
    }

    .no-control-indicator .carousel-indicators,
    .no-control-indicator .carousel-control-prev,
    .no-control-indicator .carousel-control-next {
        display: none;
    }

    .lstick {
        width: 2px;
        background: #398bf7;
        height: 30px;
        margin-left: -20px;
        margin-right: 18px;
        display: inline-block;
        vertical-align: middle;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    /*==============================================================
 For all pages
 ============================================================== */
    #main-wrapper {
        width: 100%;
    }

    .boxed #main-wrapper {
        width: 100%;
        max-width: 1300px;
        margin: 0 auto;
        box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
    }

    .boxed #main-wrapper .sidebar-footer {
        position: absolute;
    }

    .boxed #main-wrapper .footer {
        display: none;
    }

    .page-wrapper {
        background: #f4f6f9;
        padding-bottom: 60px;
        height: calc(100vh - 64px);
        position: relative;
        overflow: auto;
    }

    .container-fluid {
        padding: 25px;
    }

    /*******************
 Topbar
*******************/
    .topbar {
        position: relative;
        z-index: 50;
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
    }

    .topbar .top-navbar {
        min-height: 50px;
        padding: 0px 15px 0 0;
    }

    .topbar .top-navbar .dropdown-toggle::after {
        display: none;
    }

    .topbar .top-navbar .navbar-header {
        line-height: 45px;
        padding-left: 10px;
    }

    .topbar .top-navbar .navbar-header .navbar-brand {
        margin-right: 0px;
        padding-bottom: 0px;
        padding-top: 0px;
    }

    .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: none;
    }

    .topbar .top-navbar .navbar-header .navbar-brand b {
        line-height: 60px;
        display: inline-block;
    }

    .topbar .top-navbar .navbar-nav > .nav-item > .nav-link {
        padding-left: .75rem;
        padding-right: .75rem;
        font-size: 15px;
        line-height: 40px;
    }

    .topbar .top-navbar .navbar-nav > .nav-item.show {
        background: rgba(0, 0, 0, 0.05);
    }

    .topbar .profile-pic {
        width: 30px;
        border-radius: 100%;
    }

    .topbar .dropdown-menu {
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
        -webkit-box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
        -moz-box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
        border-color: rgba(120, 130, 140, 0.13);
    }

    .topbar .dropdown-menu .dropdown-item {
        padding: 7px 1.5rem;
    }

    .topbar ul.dropdown-user {
        padding: 0px;
        min-width: 270px;
    }

    .topbar ul.dropdown-user li {
        list-style: none;
        padding: 0px;
        margin: 0px;
    }

    .topbar ul.dropdown-user li.divider {
        height: 1px;
        margin: 9px 0;
        overflow: hidden;
        background-color: rgba(120, 130, 140, 0.13);
    }

    .topbar ul.dropdown-user li .dw-user-box {
        padding: 10px 15px;
    }

    .topbar ul.dropdown-user li .dw-user-box .u-img {
        width: 70px;
        display: inline-block;
        vertical-align: top;
    }

    .topbar ul.dropdown-user li .dw-user-box .u-img img {
        width: 100%;
        border-radius: 5px;
    }

    .topbar ul.dropdown-user li .dw-user-box .u-text {
        display: inline-block;
        padding-left: 10px;
    }

    .topbar ul.dropdown-user li .dw-user-box .u-text h4 {
        margin: 0px;
        font-size: 15px;
    }

    .topbar ul.dropdown-user li .dw-user-box .u-text p {
        margin-bottom: 2px;
        font-size: 12px;
    }

    .topbar ul.dropdown-user li .dw-user-box .u-text .btn {
        color: #ffffff;
        padding: 5px 10px;
        display: inline-block;
    }

    .topbar ul.dropdown-user li .dw-user-box .u-text .btn:hover {
        background: #e6294b;
    }

    .topbar ul.dropdown-user li a {
        padding: 9px 15px;
        display: block;
        color: #67757c;
    }

    .topbar ul.dropdown-user li a:hover {
        background: #e9edf2;
        color: #398bf7;
        text-decoration: none;
    }

    .search-box .app-search {
        position: absolute;
        margin: 0px;
        display: block;
        z-index: 110;
        width: 100%;
        top: -1px;
        box-shadow: 2px 0px 10px rgba(0, 0, 0, 0.2);
        display: none;
        left: 0px;
    }

    .search-box .app-search input {
        width: 100.5%;
        padding: 20px 40px 20px 20px;
        border-radius: 0px;
        font-size: 17px;
        transition: 0.5s ease-in;
    }

    .search-box .app-search input:focus {
        border-color: #ffffff;
    }

    .search-box .app-search .srh-btn {
        position: absolute;
        top: 23px;
        cursor: pointer;
        background: #ffffff;
        width: 15px;
        height: 15px;
        right: 20px;
        font-size: 14px;
    }

    /*******************
 Breadcrumb and page title
*******************/
    .page-titles {
        padding-bottom: 30px;
    }

    .page-titles h3 {
        margin-bottom: 0px;
        margin-top: 0px;
    }

    .page-titles .breadcrumb {
        padding: 0px;
        margin-bottom: 0px;
        background: transparent;
        font-size: 14px;
    }

    .page-titles .breadcrumb li {
        margin-top: 0px;
        margin-bottom: 0px;
    }

    .page-titles .breadcrumb .breadcrumb-item + .breadcrumb-item::before {
        content: "\\E649";
        font-family: themify;
        color: #a6b7bf;
        font-size: 11px;
    }

    .page-titles .breadcrumb .breadcrumb-item.active {
        color: #99abb4;
    }

    /*******************
 Right side toggle
*******************/
    .right-side-toggle {
        position: relative;
    }

    .btn-circle.right-side-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 25px;
        z-index: 10;
    }

    .right-side-toggle i {
        -webkit-transition-property: -webkit-transform;
        -webkit-transition-duration: 1s;
        -moz-transition-property: -moz-transform;
        -moz-transition-duration: 1s;
        transition-property: -webkit-transform;
        transition-property: transform;
        transition-property: transform, -webkit-transform;
        transition-duration: 1s;
        position: absolute;
        top: 16px;
        left: 16px;
    }

    .right-sidebar {
        position: fixed;
        right: -240px;
        width: 240px;
        display: none;
        z-index: 1100;
        background: #ffffff;
        top: 0px;
        padding-bottom: 20px;
        height: 100%;
        box-shadow: 5px 1px 40px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    .right-sidebar .rpanel-title {
        display: block;
        padding: 19px 20px;
        color: #ffffff;
        text-transform: uppercase;
        font-size: 15px;
        background: #398bf7;
    }

    .right-sidebar .rpanel-title span {
        float: right;
        cursor: pointer;
        font-size: 11px;
    }

    .right-sidebar .rpanel-title span:hover {
        color: #ffffff;
    }

    .right-sidebar .r-panel-body {
        height: 100%;
        position: absolute;
        width: 100%;
        padding-bottom: 40px;
    }

    .right-sidebar .r-panel-body ul {
        margin: 0px;
        padding: 0px 20px;
    }

    .right-sidebar .r-panel-body ul li {
        list-style: none;
        padding: 5px 0;
    }

    .shw-rside {
        right: 0px;
        width: 240px;
        display: block;
    }

    /*******************
 Footer
*******************/
    .footer {
        bottom: 0;
        color: #67757c;
        left: 0px;
        padding: 17px 15px;
        position: absolute;
        right: 0;
        border-top: 1px solid rgba(120, 130, 140, 0.13);
        background: #ffffff;
    }

    /*******************
 Card title
*******************/
    .card {
        margin-bottom: 30px;
    }

    .card .card-subtitle {
        font-weight: 300;
        margin-bottom: 15px;
        color: #99abb4;
    }

    .card-inverse .card-bodyquote .blockquote-footer,
    .card-inverse .card-link,
    .card-inverse .card-subtitle,
    .card-inverse .card-text {
        color: rgba(255, 255, 255, 0.65);
    }

    html body .card.card-success {
        background: #06d79c;
        border-color: #06d79c;
    }

    html body .card.card-danger {
        background: #ef5350;
        border-color: #ef5350;
    }

    html body .card.card-warning {
        background: #ffb22b;
        border-color: #ffb22b;
    }

    html body .card.card-info {
        background: #398bf7;
        border-color: #398bf7;
    }

    html body .card.card-primary {
        background: #745af2;
        border-color: #745af2;
    }

    html body .card.card-dark {
        background: #2f3d4a;
        border-color: #2f3d4a;
    }

    html body .card.card-megna {
        background: #56c0d8;
        border-color: #56c0d8;
    }

    /*==============================================================
 Cards page
 ============================================================== */
    .card-actions {
        float: right;
    }

    .card-actions a {
        cursor: pointer;
        color: #67757c;
        opacity: 0.7;
        padding-left: 7px;
        font-size: 13px;
    }

    .card-actions a:hover {
        opacity: 1;
    }

    .card-columns .card {
        margin-bottom: 20px;
    }

    .collapsing {
        transition: height .08s ease;
    }

    .card-info {
        background: #398bf7;
        border-color: #398bf7;
    }

    .card-primary {
        background: #745af2;
        border-color: #745af2;
    }

    .card-outline-info {
        border-color: #398bf7;
    }

    .card-outline-info .card-header {
        background: #398bf7;
        border-color: #398bf7;
    }

    .card-outline-inverse {
        border-color: #2f3d4a;
    }

    .card-outline-inverse .card-header {
        background: #2f3d4a;
        border-color: #2f3d4a;
    }

    .card-outline-warning {
        border-color: #ffb22b;
    }

    .card-outline-warning .card-header {
        background: #ffb22b;
        border-color: #ffb22b;
    }

    .card-outline-success {
        border-color: #06d79c;
    }

    .card-outline-success .card-header {
        background: #06d79c;
        border-color: #06d79c;
    }

    .card-outline-danger {
        border-color: #ef5350;
    }

    .card-outline-danger .card-header {
        background: #ef5350;
        border-color: #ef5350;
    }

    .card-outline-primary {
        border-color: #745af2;
    }

    .card-outline-primary .card-header {
        background: #745af2;
        border-color: #745af2;
    }

    /*==============================================================
 Buttons page
 ============================================================== */
    .button-group .btn {
        margin-bottom: 5px;
        margin-right: 5px;
    }

    .no-button-group .btn {
        margin-bottom: 5px;
        margin-right: 0px;
    }

    .btn .text-active {
        display: none;
    }

    .btn.active .text-active {
        display: inline-block;
    }

    .btn.active .text {
        display: none;
    }

    /*==============================================================
Breadcrumb
 ============================================================== */
    .bc-colored .breadcrumb-item,
    .bc-colored .breadcrumb-item a {
        color: #ffffff;
    }

    .bc-colored .breadcrumb-item.active,
    .bc-colored .breadcrumb-item a.active {
        opacity: 0.7;
    }

    .bc-colored .breadcrumb-item + .breadcrumb-item::before {
        color: rgba(255, 255, 255, 0.4);
    }

    .breadcrumb {
        margin-bottom: 0px;
    }

    /*==============================================================
 Ui-bootstrap
 ============================================================== */
    ul.list-icons {
        margin: 0px;
        padding: 0px;
    }

    ul.list-icons li {
        list-style: none;
        line-height: 30px;
        margin: 5px 0;
        transition: 0.2s ease-in;
    }

    ul.list-icons li a {
        color: #67757c;
    }

    ul.list-icons li a:hover {
        color: #398bf7;
    }

    ul.list-icons li i {
        font-size: 13px;
        padding-right: 8px;
    }

    ul.list-inline li {
        display: inline-block;
        padding: 0 8px;
    }

    ul.two-part {
        margin: 0px;
    }

    ul.two-part li {
        width: 48.8%;
    }

    /*Accordion*/
    html body .accordion .card {
        margin-bottom: 0px;
    }

    /*==============================================================
 sparkline chart
 ============================================================== */
    html body .jqstooltip,
    html body .flotTip {
        width: auto !important;
        height: auto !important;
        background: #263238;
        color: #ffffff;
        padding: 5px 10px;
    }

    body .jqstooltip {
        border-color: transparent;
        border-radius: 60px;
    }

    /*==============================================================
Dashboard1 chart
 ============================================================== */
    /*******************
Pagination
******************/
    .pagination-circle li.active a {
        background: #06d79c;
    }

    .pagination-circle li a {
        width: 40px;
        height: 40px;
        background: #e9edf2;
        border: 0px;
        text-align: center;
        border-radius: 100%;
    }

    .pagination-circle li a:first-child, .pagination-circle li a:last-child {
        border-radius: 100%;
    }

    .pagination-circle li a:hover {
        background: #06d79c;
        color: #ffffff;
    }

    .pagination-circle li.disabled a {
        background: #e9edf2;
        color: rgba(120, 130, 140, 0.13);
    }

    /*******************
Table-Layout
******************/
    .table thead th,
    .table th {
        border: 0px;
    }

    .color-table.primary-table thead th {
        background-color: #745af2;
        color: #ffffff;
    }

    .table-striped tbody tr:nth-of-type(odd) {
        background: #e9edf2;
    }

    .color-table.success-table thead th {
        background-color: #06d79c;
        color: #ffffff;
    }

    .color-table.info-table thead th {
        background-color: #398bf7;
        color: #ffffff;
    }

    .color-table.warning-table thead th {
        background-color: #ffb22b;
        color: #ffffff;
    }

    .color-table.danger-table thead th {
        background-color: #ef5350;
        color: #ffffff;
    }

    .color-table.inverse-table thead th {
        background-color: #2f3d4a;
        color: #ffffff;
    }

    .color-table.dark-table thead th {
        background-color: #263238;
        color: #ffffff;
    }

    .color-table.red-table thead th {
        background-color: #fb3a3a;
        color: #ffffff;
    }

    .color-table.purple-table thead th {
        background-color: #7460ee;
        color: #ffffff;
    }

    .color-table.muted-table thead th {
        background-color: #99abb4;
        color: #ffffff;
    }

    .color-bordered-table.primary-bordered-table {
        border: 2px solid #745af2;
    }

    .color-bordered-table.primary-bordered-table thead th {
        background-color: #745af2;
        color: #ffffff;
    }

    .color-bordered-table.success-bordered-table {
        border: 2px solid #06d79c;
    }

    .color-bordered-table.success-bordered-table thead th {
        background-color: #06d79c;
        color: #ffffff;
    }

    .color-bordered-table.info-bordered-table {
        border: 2px solid #398bf7;
    }

    .color-bordered-table.info-bordered-table thead th {
        background-color: #398bf7;
        color: #ffffff;
    }

    .color-bordered-table.warning-bordered-table {
        border: 2px solid #ffb22b;
    }

    .color-bordered-table.warning-bordered-table thead th {
        background-color: #ffb22b;
        color: #ffffff;
    }

    .color-bordered-table.danger-bordered-table {
        border: 2px solid #ef5350;
    }

    .color-bordered-table.danger-bordered-table thead th {
        background-color: #ef5350;
        color: #ffffff;
    }

    .color-bordered-table.inverse-bordered-table {
        border: 2px solid #2f3d4a;
    }

    .color-bordered-table.inverse-bordered-table thead th {
        background-color: #2f3d4a;
        color: #ffffff;
    }

    .color-bordered-table.dark-bordered-table {
        border: 2px solid #263238;
    }

    .color-bordered-table.dark-bordered-table thead th {
        background-color: #263238;
        color: #ffffff;
    }

    .color-bordered-table.red-bordered-table {
        border: 2px solid #fb3a3a;
    }

    .color-bordered-table.red-bordered-table thead th {
        background-color: #fb3a3a;
        color: #ffffff;
    }

    .color-bordered-table.purple-bordered-table {
        border: 2px solid #7460ee;
    }

    .color-bordered-table.purple-bordered-table thead th {
        background-color: #7460ee;
        color: #ffffff;
    }

    .color-bordered-table.muted-bordered-table {
        border: 2px solid #99abb4;
    }

    .color-bordered-table.muted-bordered-table thead th {
        background-color: #99abb4;
        color: #ffffff;
    }

    .full-color-table.full-primary-table {
        background-color: #f1effd;
    }

    .full-color-table.full-primary-table thead th {
        background-color: #745af2;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-primary-table tbody td {
        border: 0;
    }

    .full-color-table.full-primary-table tr:hover {
        background-color: #745af2;
        color: #ffffff;
    }

    .full-color-table.full-success-table {
        background-color: #e8fdeb;
    }

    .full-color-table.full-success-table thead th {
        background-color: #06d79c;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-success-table tbody td {
        border: 0;
    }

    .full-color-table.full-success-table tr:hover {
        background-color: #06d79c;
        color: #ffffff;
    }

    .full-color-table.full-info-table {
        background-color: #cfecfe;
    }

    .full-color-table.full-info-table thead th {
        background-color: #398bf7;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-info-table tbody td {
        border: 0;
    }

    .full-color-table.full-info-table tr:hover {
        background-color: #398bf7;
        color: #ffffff;
    }

    .full-color-table.full-warning-table {
        background-color: #fff8ec;
    }

    .full-color-table.full-warning-table thead th {
        background-color: #ffb22b;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-warning-table tbody td {
        border: 0;
    }

    .full-color-table.full-warning-table tr:hover {
        background-color: #ffb22b;
        color: #ffffff;
    }

    .full-color-table.full-danger-table {
        background-color: #f9e7eb;
    }

    .full-color-table.full-danger-table thead th {
        background-color: #ef5350;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-danger-table tbody td {
        border: 0;
    }

    .full-color-table.full-danger-table tr:hover {
        background-color: #ef5350;
        color: #ffffff;
    }

    .full-color-table.full-inverse-table {
        background-color: #f6f6f6;
    }

    .full-color-table.full-inverse-table thead th {
        background-color: #2f3d4a;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-inverse-table tbody td {
        border: 0;
    }

    .full-color-table.full-inverse-table tr:hover {
        background-color: #2f3d4a;
        color: #ffffff;
    }

    .full-color-table.full-dark-table {
        background-color: rgba(43, 43, 43, 0.8);
    }

    .full-color-table.full-dark-table thead th {
        background-color: #263238;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-dark-table tbody td {
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-dark-table tr:hover {
        background-color: #263238;
        color: #ffffff;
    }

    .full-color-table.full-red-table {
        background-color: #f9e7eb;
    }

    .full-color-table.full-red-table thead th {
        background-color: #fb3a3a;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-red-table tbody td {
        border: 0;
    }

    .full-color-table.full-red-table tr:hover {
        background-color: #fb3a3a;
        color: #ffffff;
    }

    .full-color-table.full-purple-table {
        background-color: #f1effd;
    }

    .full-color-table.full-purple-table thead th {
        background-color: #7460ee;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-purple-table tbody td {
        border: 0;
    }

    .full-color-table.full-purple-table tr:hover {
        background-color: #7460ee;
        color: #ffffff;
    }

    .full-color-table.full-muted-table {
        background-color: rgba(152, 166, 173, 0.2);
    }

    .full-color-table.full-muted-table thead th {
        background-color: #99abb4;
        border: 0;
        color: #ffffff;
    }

    .full-color-table.full-muted-table tbody td {
        border: 0;
    }

    .full-color-table.full-muted-table tr:hover {
        background-color: #99abb4;
        color: #ffffff;
    }

    /*******************
Table- editable table
******************/
    .dt-bootstrap {
        display: block;
    }

    .paging_simple_numbers .pagination .paginate_button {
        padding: 0px;
        background: #ffffff;
    }

    .paging_simple_numbers .pagination .paginate_button:hover {
        background: #ffffff;
    }

    .paging_simple_numbers .pagination .paginate_button a {
        padding: 2px 10px;
        border: 0px;
    }

    .paging_simple_numbers .pagination .paginate_button.active a,
    .paging_simple_numbers .pagination .paginate_button:hover a {
        background: #398bf7;
        color: #ffffff;
    }

    /*******************
Icon list fontawesom
******************/
    .icon-list-demo div {
        cursor: pointer;
        line-height: 60px;
        white-space: nowrap;
        color: #67757c;
    }

    .icon-list-demo div:hover {
        color: #263238;
    }

    .icon-list-demo div p {
        margin: 10px 0;
        padding: 5px 0;
    }

    .icon-list-demo i {
        -webkit-transition: all 0.2s;
        -webkit-transition: font-size .2s;
        display: inline-block;
        font-size: 18px;
        margin: 0 15px 0 10px;
        text-align: left;
        transition: all 0.2s;
        transition: font-size .2s;
        vertical-align: middle;
        transition: all 0.3s ease 0s;
    }

    .icon-list-demo .col-md-4,
    .icon-list-demo .col-3 {
        border-radius: 4px;
    }

    .icon-list-demo .col-md-4:hover,
    .icon-list-demo .col-3:hover {
        background-color: #ebf3f5;
    }

    .icon-list-demo .div:hover i {
        font-size: 2em;
    }

    /*******************
Icon list material icon
******************/
    .material-icon-list-demo .mdi {
        font-size: 21px;
    }

    /*******************
list and media
******************/
    .list-group a.list-group-item:hover {
        background: #e9edf2;
    }

    .list-group-item.active,
    .list-group .list-group-item.active:hover {
        background: #398bf7;
        border-color: #398bf7;
    }

    .list-group-item.disabled {
        color: #99abb4;
        background: #e9edf2;
    }

    .media {
        border: 1px solid rgba(120, 130, 140, 0.13);
        margin-bottom: 10px;
        padding: 15px;
    }

    /*******************
Timeline page
******************/
    .timeline {
        position: relative;
        padding: 20px 0 20px;
        list-style: none;
        max-width: 1200px;
        margin: 0 auto;
    }

    .timeline:before {
        content: " ";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 3px;
        margin-left: -1.5px;
        background-color: #e9edf2;
    }

    .timeline > li {
        position: relative;
        margin-bottom: 20px;
    }

    .timeline > li:before,
    .timeline > li:after {
        content: " ";
        display: table;
    }

    .timeline > li:after {
        clear: both;
    }

    .timeline > li:before,
    .timeline > li:after {
        content: " ";
        display: table;
    }

    .timeline > li:after {
        clear: both;
    }

    .timeline > li > .timeline-panel {
        float: left;
        position: relative;
        width: 46%;
        padding: 20px;
        border: 1px solid rgba(120, 130, 140, 0.13);
        border-radius: 4px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
    }

    .timeline > li > .timeline-panel:before {
        content: " ";
        display: inline-block;
        position: absolute;
        top: 26px;
        right: -8px;
        border-top: 8px solid transparent;
        border-right: 0 solid rgba(120, 130, 140, 0.13);
        border-bottom: 8px solid transparent;
        border-left: 8px solid rgba(120, 130, 140, 0.13);
    }

    .timeline > li > .timeline-panel:after {
        content: " ";
        display: inline-block;
        position: absolute;
        top: 27px;
        right: -7px;
        border-top: 7px solid transparent;
        border-right: 0 solid #ffffff;
        border-bottom: 7px solid transparent;
        border-left: 7px solid #ffffff;
    }

    .timeline > li > .timeline-badge {
        z-index: 10;
        position: absolute;
        top: 16px;
        left: 50%;
        width: 50px;
        height: 50px;
        margin-left: -25px;
        border-radius: 50% 50% 50% 50%;
        text-align: center;
        font-size: 1.4em;
        line-height: 50px;
        color: #fff;
        overflow: hidden;
    }

    .timeline > li.timeline-inverted > .timeline-panel {
        float: right;
    }

    .timeline > li.timeline-inverted > .timeline-panel:before {
        right: auto;
        left: -8px;
        border-right-width: 8px;
        border-left-width: 0;
    }

    .timeline > li.timeline-inverted > .timeline-panel:after {
        right: auto;
        left: -7px;
        border-right-width: 7px;
        border-left-width: 0;
    }

    .timeline-badge.primary {
        background-color: #745af2;
    }

    .timeline-badge.success {
        background-color: #06d79c;
    }

    .timeline-badge.warning {
        background-color: #ffb22b;
    }

    .timeline-badge.danger {
        background-color: #ef5350;
    }

    .timeline-badge.info {
        background-color: #398bf7;
    }

    .timeline-title {
        margin-top: 0;
        color: inherit;
        font-weight: 400;
    }

    .timeline-body > p,
    .timeline-body > ul {
        margin-bottom: 0;
    }

    .timeline-body > p + p {
        margin-top: 5px;
    }

    /*******************
Error Page
******************/
    .error-box {
        height: 100%;
        position: fixed;
        background: url(error-bg.48d61f016cb4f54bc87a.jpg) no-repeat center center #fff;
        width: 100%;
    }

    .error-box .footer {
        width: 100%;
        left: 0px;
        right: 0px;
    }

    .error-body {
        padding-top: 5%;
    }

    .error-body h1 {
        font-size: 210px;
        font-weight: 900;
        line-height: 210px;
    }

    /*******************
Login register and recover password Page
******************/
    .login-register {
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        height: 100%;
        width: 100%;
        padding: 5% 0;
        position: fixed;
    }

    .login-box {
        width: 400px;
        margin: 0 auto;
    }

    .login-box .footer {
        width: 100%;
        left: 0px;
        right: 0px;
    }

    .login-box .social {
        display: block;
        margin-bottom: 30px;
    }

    #recoverform {
        display: none;
    }

    .login-sidebar {
        padding: 0px;
        margin-top: 0px;
    }

    .login-sidebar .login-box {
        right: 0px;
        position: absolute;
        height: 100%;
    }

    /*******************
Pricing Page
******************/
    .pricing-box {
        position: relative;
        text-align: center;
        margin-top: 30px;
    }

    .featured-plan {
        margin-top: 0px;
    }

    .featured-plan .pricing-body {
        padding: 60px 0;
        background: #ebf3f5;
        border: 1px solid #ddd;
    }

    .featured-plan .price-table-content .price-row {
        border-top: 1px solid rgba(120, 130, 140, 0.13);
    }

    .pricing-body {
        border-radius: 0px;
        border-top: 1px solid rgba(120, 130, 140, 0.13);
        border-bottom: 5px solid rgba(120, 130, 140, 0.13);
        vertical-align: middle;
        padding: 30px 0;
        position: relative;
    }

    .pricing-body h2 {
        position: relative;
        font-size: 56px;
        margin: 20px 0 10px;
        font-weight: 500;
    }

    .pricing-body h2 span {
        position: absolute;
        font-size: 15px;
        top: -10px;
        margin-left: -10px;
    }

    .price-table-content .price-row {
        padding: 20px 0;
        border-top: 1px solid rgba(120, 130, 140, 0.13);
    }

    .pricing-plan {
        padding: 0 15px;
    }

    .pricing-plan .no-padding {
        padding: 0px;
    }

    .price-lable {
        position: absolute;
        top: -10px;
        padding: 5px 10px;
        margin: 0 auto;
        display: inline-block;
        width: 100px;
        left: 0px;
        right: 0px;
    }

    /*Documentation page*/
    .plugin-details {
        display: none;
    }

    .plugin-details-active {
        display: block;
    }

    .earning-box h6 {
        font-weight: 500;
        margin-bottom: 0px;
        white-space: nowrap;
    }

    .earning-box td,
    .earning-box th {
        vertical-align: middle;
    }

    .btn-link {
        border: 0px;
    }

    /*******************
Smart table
******************/
    .smart-table tr td, .smart-table tr th {
        padding: 15px !important;
    }

    .ng2-smart-action-add-add {
        color: #ffffff !important;
        background: #398bf7;
        padding: 8px 15px;
        border-radius: 4px;
    }

    .ng2-smart-pagination-nav {
        margin-left: auto;
    }

    .ng2-smart-pagination-nav .pagination > li > a {
        line-height: 1rem;
    }

    /*******************
NGX Data table
******************/
    .ngx-datatable.material {
        box-shadow: none !important;
        border: 1px solid rgba(120, 130, 140, 0.13);
    }

    /*******************
Chartistt chart css
******************/
    .barchrt .ct-series-a .ct-bar {
        stroke: #06d79c;
    }

    .barchrt .ct-series-b .ct-bar {
        stroke: #398bf7;
    }

    .linearea {
        height: 280px;
    }

    .linearea .ct-series-a .ct-area {
        fill-opacity: 0.05;
        fill: #06d79c;
    }

    .linearea .ct-series-a .ct-line,
    .linearea .ct-series-a .ct-point {
        stroke: #06d79c;
        stroke-width: 2px;
    }

    .linearea .ct-series-b .ct-area {
        fill: #398bf7;
        fill-opacity: 0.1;
    }

    .linearea .ct-series-b .ct-line,
    .linearea .ct-series-b .ct-point {
        stroke: #398bf7;
        stroke-width: 2px;
    }

    .linearea .ct-series-c .ct-area {
        fill: #ef5350;
        fill-opacity: 0.1;
    }

    .linearea .ct-series-c .ct-line,
    .linearea .ct-series-c .ct-point {
        stroke: #ef5350;
        stroke-width: 2px;
    }

    .linearea .ct-series-a .ct-point,
    .linearea .ct-series-b .ct-point,
    .linearea .ct-series-c .ct-point {
        stroke-width: 6px;
    }

    .piechart .ct-series-a .ct-slice-donut {
        stroke: #398bf7;
    }

    .piechart .ct-series-b .ct-slice-donut {
        stroke: #06d79c;
    }

    .piechart .ct-series-c .ct-slice-donut {
        stroke: #2f3d4a;
    }

    .piechart .ct-series-d .ct-slice-donut {
        stroke: #ef5350;
    }

    .piechart .ct-series-e .ct-slice-donut {
        stroke: #ffb22b;
    }

    /*******************
Taskboard scss
******************/
    .taskboard {
        overflow-x: auto;
        overflow-y: auto;
        white-space: nowrap;
        padding: 8px;
    }

    .taskboard .taskboard-wrapper {
        width: 280px;
        padding-right: 8px;
        padding-left: 8px;
        box-sizing: border-box;
        display: inline-block;
        vertical-align: top;
        height: 100%;
    }

    .taskboard .taskboard-wrapper:first-child {
        padding-left: 0;
    }

    .taskboard .taskboard-wrapper:last-child {
        padding-right: 0;
    }

    .taskboard .taskboard-list {
        box-sizing: border-box;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        max-height: 100%;
        white-space: normal;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 0;
    }

    .taskboard .taskboard-header {
        position: relative;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: horizontal;
        -webkit-box-direction: normal;
        -ms-flex-direction: row;
        flex-direction: row;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        text-transform: uppercase;
        letter-spacing: 0.02rem;
        padding: 8px 8px 0;
    }

    .taskboard .taskboard-task {
        position: relative;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        padding: 8px;
        margin-bottom: 8px;
        background: #ffffff;
    }

    .taskboard .taskboard-task:last-child {
        margin-bottom: 0;
    }

    .taskboard .taskboard-task:hover {
        cursor: -webkit-grab;
        cursor: grab;
    }

    .taskboard .taskboard-task:after {
        content: "";
        position: absolute;
        border: 4px solid transparent;
        top: 0;
        border-top-width: 12px;
        border-bottom-color: transparent;
        right: 6px;
    }

    .taskboard .taskboard-task.task-status-success:after {
        border-top-color: #06d79c;
        border-right-color: #06d79c;
        border-left-color: #06d79c;
    }

    .taskboard .taskboard-task.task-status-info:after {
        border-top-color: #398bf7;
        border-right-color: #398bf7;
        border-left-color: #398bf7;
    }

    .taskboard .taskboard-task.task-status-warning:after {
        border-top-color: #ffb22b;
        border-right-color: #ffb22b;
        border-left-color: #ffb22b;
    }

    .taskboard .taskboard-task.task-status-danger:after {
        border-top-color: #ef5350;
        border-right-color: #ef5350;
        border-left-color: #ef5350;
    }

    .taskboard .taskboard-cards {
        padding: 8px;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .taskboard .taskboard-task-title {
        margin-bottom: 8px;
    }

    /*******************/
    /*Activity widgets*/
    /*******************/
    .activity-box .date-devider {
        border-top: 2px solid rgba(120, 130, 140, 0.13);
        position: relative;
    }

    .activity-box .date-devider span {
        background: #e9edf2;
        padding: 5px 15px;
        border-radius: 60px;
        font-size: 14px;
        top: -15px;
        position: relative;
        margin-left: 20px;
    }

    .activity-box .activity-item {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        margin-bottom: 30px;
    }

    .activity-box .activity-item .image-list > a {
        margin-left: -15px;
        position: relative;
        vertical-align: middle;
    }

    .activity-box .activity-item .image-list > a:first-child, .activity-box .activity-item .image-list > a:last-child {
        margin-left: 0px;
    }

    .activity-box .activity-item .image-list > a:hover {
        z-index: 10;
    }

    .activity-box .activity-item .image-list > a:hover img {
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
    }

    /*
Template Name: Admin Pro Admin
Author: Wrappixel
Email: niravjoshi87@gmail.com
File: scss
*/
    /*******************
Main sidebar
******************/
    .left-sidebar {
        position: absolute;
        width: 240px;
        height: 100vh;
        top: 0px;
        z-index: 20;
        padding-top: 70px;
        background: #fff;
        box-shadow: 1px 0px 20px rgba(0, 0, 0, 0.08);
    }

    .fix-sidebar .left-sidebar {
        position: fixed;
    }

    /*******************
user profile section
******************/
    .sidebar-nav .user-profile > a img {
        width: 30px;
        border-radius: 100%;
        margin-right: 10px;
    }

    .sidebar-nav .user-profile > ul {
        padding-left: 40px;
    }

    /*******************
sidebar navigation
******************/
    .scroll-sidebar {
        height: calc(100vh - 70px);
        position: relative;
    }

    .scroll-sidebar.ps .ps__rail-y {
        left: 2px;
        right: auto;
        background: none;
        width: 6px;
    }

    .collapse.in {
        display: block;
    }

    .nav-small-cap {
        font-size: 12px;
        margin-bottom: 0px;
        padding: 14px 14px 14px 20px;
        font-weight: 500;
    }

    .sidebar-nav {
        padding: 15px 0 0 0px;
    }

    .sidebar-nav ul {
        margin: 0px;
        padding: 0px;
    }

    .sidebar-nav ul li {
        list-style: none;
    }

    .sidebar-nav ul li a {
        color: #687384;
        padding: 8px 35px 8px 15px;
        display: block;
        font-size: 14px;
        font-weight: 400;
    }

    .sidebar-nav ul li a.active, .sidebar-nav ul li a:hover {
        color: #398bf7;
    }

    .sidebar-nav ul li a.active i, .sidebar-nav ul li a:hover i {
        color: #398bf7;
    }

    .sidebar-nav ul li a.active {
        font-weight: 500;
        color: #263238;
    }

    .sidebar-nav ul li ul {
        padding-left: 36px;
    }

    .sidebar-nav ul li ul ul {
        padding-left: 15px;
    }

    .sidebar-nav ul li.nav-devider {
        height: 1px;
        background: rgba(120, 130, 140, 0.13);
        display: block;
        margin: 15px 0;
    }

    .sidebar-nav > ul > li > a i {
        width: 31px;
        font-size: 24px;
        display: inline-block;
        vertical-align: middle;
        color: #555f6d;
    }

    .sidebar-nav > ul > li > a .label {
        float: right;
        margin-top: 6px;
    }

    .sidebar-nav > ul > li > a.active {
        font-weight: 400;
        background: #242933;
        color: #26c6da;
    }

    .sidebar-nav > ul > li {
        margin-bottom: 5px;
    }

    .sidebar-nav > ul > li.active > a {
        color: #398bf7;
        font-weight: 500;
    }

    .sidebar-nav > ul > li.active > a i {
        color: #398bf7;
    }

    .sidebar-nav .waves-effect {
        transition: none;
        -webkit-transition: none;
        -o-transition: none;
    }

    .sidebar-nav .has-arrow {
        position: relative;
    }

    .sidebar-nav .has-arrow::after {
        position: absolute;
        content: '';
        width: 7px;
        height: 7px;
        border-width: 1px 0 0 1px;
        border-style: solid;
        border-color: #687384;
        right: 1em;
        -webkit-transform: rotate(135deg) translate(0, -50%);
        transform: rotate(135deg) translate(0, -50%);
        -webkit-transform-origin: top;
        transform-origin: top;
        top: 23px;
        transition: all .3s ease-out;
    }

    .sidebar-nav .active > .has-arrow::after,
    .sidebar-nav li > .has-arrow.active::after,
    .sidebar-nav .has-arrow[aria-expanded="true"]::after {
        -webkit-transform: rotate(-135deg) translate(0, -50%);
        -ms-transform: rotate(-135deg) translate(0, -50%);
        -o-transform: rotate(-135deg) translate(0, -50%);
        top: 45%;
        width: 7px;
        transform: rotate(-135deg) translate(0, -50%);
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*******************
/*User mail widgets*/
    /*******************/
    .topbar .top-navbar .mailbox {
        width: 300px;
    }

    .topbar .top-navbar .mailbox ul {
        padding: 0px;
    }

    .topbar .top-navbar .mailbox ul li {
        list-style: none;
    }

    .mailbox ul li .drop-title {
        font-weight: 500;
        padding: 11px 20px 15px;
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
    }

    .mailbox ul li .nav-link {
        border-top: 1px solid rgba(120, 130, 140, 0.13);
        padding-top: 15px;
    }

    .mailbox .message-center {
        height: 200px;
        overflow: auto;
        position: relative;
    }

    .mailbox .message-center a {
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
        display: block;
        text-decoration: none;
        padding: 9px 15px;
    }

    .mailbox .message-center a:hover {
        background: #e9edf2;
    }

    .mailbox .message-center a div {
        white-space: normal;
    }

    .mailbox .message-center a .user-img {
        width: 40px;
        position: relative;
        display: inline-block;
        margin: 0 10px 15px 0;
    }

    .mailbox .message-center a .user-img img {
        width: 100%;
    }

    .mailbox .message-center a .user-img .profile-status {
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: inline-block;
        height: 10px;
        left: 30px;
        position: absolute;
        top: 1px;
        width: 10px;
    }

    .mailbox .message-center a .user-img .online {
        background: #06d79c;
    }

    .mailbox .message-center a .user-img .busy {
        background: #ef5350;
    }

    .mailbox .message-center a .user-img .away {
        background: #ffb22b;
    }

    .mailbox .message-center a .user-img .offline {
        background: #ffb22b;
    }

    .mailbox .message-center a .mail-contnet {
        display: inline-block;
        width: 75%;
        vertical-align: middle;
    }

    .mailbox .message-center a .mail-contnet h5 {
        margin: 5px 0px 0;
    }

    .mailbox .message-center a .mail-contnet .mail-desc,
    .mailbox .message-center a .mail-contnet .time {
        font-size: 12px;
        display: block;
        margin: 1px 0;
        text-overflow: ellipsis;
        overflow: hidden;
        color: #67757c;
        white-space: nowrap;
    }

    /*******************
/*States row*/
    /*******************/
    .stats-row {
        margin-bottom: 20px;
    }

    .stats-row .stat-item {
        display: inline-block;
        padding-right: 15px;
    }

    .stats-row .stat-item + .stat-item {
        padding-left: 15px;
        border-left: 1px solid rgba(120, 130, 140, 0.13);
    }

    /*******************/
    /*Comment widgets*/
    /*******************/
    .comment-widgets {
        position: relative;
        margin-bottom: 10px;
    }

    .comment-widgets .comment-row {
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
        padding: 15px;
    }

    .comment-widgets .comment-row:last-child {
        border-bottom: 0px;
    }

    .comment-widgets .comment-row:hover, .comment-widgets .comment-row.active {
        background: rgba(0, 0, 0, 0.02);
    }

    .comment-text {
        padding: 15px 15px 15px 20px;
        width: 80%;
    }

    .comment-text:hover .comment-footer .action-icons,
    .comment-text.active .comment-footer .action-icons {
        visibility: visible;
    }

    .comment-text p {
        max-height: 50px;
        width: 100%;
        overflow: hidden;
    }

    .comment-footer .action-icons {
        visibility: hidden;
    }

    .comment-footer .action-icons a {
        padding-left: 7px;
        vertical-align: middle;
        color: #99abb4;
    }

    .comment-footer .action-icons a:hover, .comment-footer .action-icons a.active {
        color: #398bf7;
    }

    /*******************/
    /*To do widgets*/
    /*******************/
    .todo-list li {
        border: 0px;
        margin-bottom: 0px;
        padding: 20px 15px 15px 0px;
    }

    .todo-list li .checkbox {
        width: 100%;
    }

    .todo-list li .checkbox label {
        font-weight: 400;
        color: #455a64;
    }

    .todo-list li:last-child {
        border-bottom: 0px;
    }

    .todo-list li .assignedto {
        padding: 0px 0 0 27px;
        margin: 0px;
    }

    .todo-list li .assignedto li {
        list-style: none;
        padding: 0px;
        display: inline-block;
        border: 0px;
        margin-right: 2px;
    }

    .todo-list li .assignedto li img {
        width: 30px;
        border-radius: 100%;
    }

    .todo-list li .item-date {
        padding-left: 25px;
        font-size: 12px;
        display: inline-block;
    }

    .list-task .task-done span {
        text-decoration: line-through;
    }

    /*******************/
    /*Chat widget*/
    /*******************/
    .message-box ul li .drop-title {
        font-weight: 500;
        padding: 11px 20px 15px;
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
    }

    .message-box ul li .nav-link {
        border-top: 1px solid rgba(120, 130, 140, 0.13);
        padding-top: 15px;
    }

    .message-box .message-widget {
        position: relative;
    }

    .message-box .message-widget a {
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
        display: block;
        text-decoration: none;
        padding: 9px 15px;
    }

    .message-box .message-widget a:hover {
        background: #e9edf2;
    }

    .message-box .message-widget a:last-child {
        border-bottom: 0px;
    }

    .message-box .message-widget a div {
        white-space: normal;
    }

    .message-box .message-widget a .user-img {
        width: 45px;
        position: relative;
        display: inline-block;
        margin: 0 10px 15px 0;
    }

    .message-box .message-widget a .user-img img {
        width: 100%;
    }

    .message-box .message-widget a .user-img .profile-status {
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: inline-block;
        height: 10px;
        left: 33px;
        position: absolute;
        top: -1px;
        width: 10px;
    }

    .message-box .message-widget a .user-img .online {
        background: #06d79c;
    }

    .message-box .message-widget a .user-img .busy {
        background: #ef5350;
    }

    .message-box .message-widget a .user-img .away {
        background: #ffb22b;
    }

    .message-box .message-widget a .user-img .offline {
        background: #ffb22b;
    }

    .message-box .message-widget a .mail-contnet {
        display: inline-block;
        width: 73%;
        vertical-align: middle;
    }

    .message-box .message-widget a .mail-contnet h5 {
        margin: 5px 0px 0;
    }

    .message-box .message-widget a .mail-contnet .mail-desc,
    .message-box .message-widget a .mail-contnet .time {
        font-size: 12px;
        display: block;
        margin: 1px 0;
        text-overflow: ellipsis;
        overflow: hidden;
        color: #67757c;
        white-space: nowrap;
    }

    /*******************/
    /*Steam line widget*/
    /*******************/
    .steamline {
        position: relative;
        border-left: 1px solid rgba(120, 130, 140, 0.13);
        margin-left: 20px;
    }

    .steamline .sl-left {
        float: left;
        margin-left: -20px;
        z-index: 1;
        width: 40px;
        line-height: 40px;
        text-align: center;
        height: 40px;
        border-radius: 100%;
        color: #ffffff;
        background: #263238;
        margin-right: 15px;
    }

    .steamline .sl-left img {
        max-width: 40px;
    }

    .steamline .sl-right {
        padding-left: 50px;
    }

    .steamline .sl-right .desc,
    .steamline .sl-right .inline-photos {
        margin-bottom: 30px;
    }

    .steamline .sl-item {
        border-bottom: 1px solid rgba(120, 130, 140, 0.13);
        margin: 20px 0;
    }

    .sl-date {
        font-size: 10px;
        color: #99abb4;
    }

    .time-item {
        border-color: rgba(120, 130, 140, 0.13);
        padding-bottom: 1px;
        position: relative;
    }

    .time-item:before {
        content: " ";
        display: table;
    }

    .time-item:after {
        background-color: #ffffff;
        border-color: rgba(120, 130, 140, 0.13);
        border-radius: 10px;
        border-style: solid;
        border-width: 2px;
        bottom: 0;
        content: '';
        height: 14px;
        left: 0;
        margin-left: -8px;
        position: absolute;
        top: 5px;
        width: 14px;
    }

    .time-item-item:after {
        content: " ";
        display: table;
    }

    .item-info {
        margin-bottom: 15px;
        margin-left: 15px;
    }

    .item-info p {
        margin-bottom: 10px !important;
    }

    /*******************/
    /*Feed widget*/
    /*******************/
    .feeds {
        margin: 0px;
        padding: 0px;
    }

    .feeds li {
        list-style: none;
        padding: 10px;
        display: block;
    }

    .feeds li:hover {
        background: #ebf3f5;
    }

    .feeds li > div {
        width: 40px;
        height: 40px;
        margin-right: 5px;
        display: inline-block;
        text-align: center;
        vertical-align: middle;
        border-radius: 100%;
    }

    .feeds li > div i {
        line-height: 40px;
    }

    .feeds li span {
        float: right;
        width: auto;
        font-size: 12px;
    }

    /*******************/
    /*Vertical carousel*/
    /*******************/
    .vert .carousel-item-next.carousel-item-left,
    .vert .carousel-item-prev.carousel-item-right {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }

    .vert .carousel-item-next,
    .vert .active.carousel-item-right {
        -webkit-transform: translate3d(0, 100%, 0);
        transform: translate3d(0, 100% 0);
    }

    .vert .carousel-item-prev,
    .vert .active.carousel-item-left {
        -webkit-transform: translate3d(0, -100%, 0);
        transform: translate3d(0, -100%, 0);
    }

    /*******************/
    /*social-widgets*/
    /*******************/
    .social-widget .soc-header {
        padding: 15px;
        text-align: center;
        font-size: 36px;
        color: #fff;
    }

    .social-widget .soc-header.box-facebook {
        background: #3b5998;
    }

    .social-widget .soc-header.box-twitter {
        background: #00aced;
    }

    .social-widget .soc-header.box-google {
        background: #f86c6b;
    }

    .social-widget .soc-header.box-linkedin {
        background: #4875b4;
    }

    .social-widget .soc-content {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        text-align: center;
    }

    .social-widget .soc-content div {
        padding: 10px;
    }

    .social-widget .soc-content div h3 {
        margin-bottom: 0px;
    }

    /*******************/
    /*social-profile-first*/
    /*******************/
    .social-profile-first {
        text-align: center;
        padding-top: 22%;
        margin-bottom: 96px;
    }

    .social-profile-first.bg-over {
        background: rgba(56, 83, 161, 0.7);
    }

    .social-profile-first .middle {
        vertical-align: middle;
    }

    /*******************/
    /*country-state*/
    /*******************/
    .country-state {
        list-style: none;
        margin: 0;
        padding: 0 0 0 10px;
    }

    .country-state li {
        margin-top: 30px;
        margin-bottom: 10px;
    }

    .country-state h2 {
        margin-bottom: 0px;
        font-weight: 400;
    }

    /*******************/
    /*profile timeline widget*/
    /*******************/
    .profiletimeline {
        position: relative;
        padding-left: 40px;
        margin-right: 10px;
        border-left: 1px solid rgba(120, 130, 140, 0.13);
        margin-left: 30px;
    }

    .profiletimeline .sl-left {
        float: left;
        margin-left: -60px;
        z-index: 1;
        margin-right: 15px;
    }

    .profiletimeline .sl-left img {
        max-width: 40px;
    }

    .profiletimeline .sl-item {
        margin-top: 8px;
        margin-bottom: 30px;
    }

    .profiletimeline .sl-date {
        font-size: 12px;
        color: #99abb4;
    }

    .profiletimeline .time-item {
        border-color: rgba(120, 130, 140, 0.13);
        padding-bottom: 1px;
        position: relative;
    }

    .profiletimeline .time-item:before {
        content: " ";
        display: table;
    }

    .profiletimeline .time-item:after {
        background-color: #ffffff;
        border-color: rgba(120, 130, 140, 0.13);
        border-radius: 10px;
        border-style: solid;
        border-width: 2px;
        bottom: 0;
        content: '';
        height: 14px;
        left: 0;
        margin-left: -8px;
        position: absolute;
        top: 5px;
        width: 14px;
    }

    .profiletimeline .time-item-item:after {
        content: " ";
        display: table;
    }

    .profiletimeline .item-info {
        margin-bottom: 15px;
        margin-left: 15px;
    }

    .profiletimeline .item-info p {
        margin-bottom: 10px !important;
    }

    /*Blog widgets*/
    .blog-widget {
        margin-top: 30px;
    }

    .blog-widget .blog-image img {
        border-radius: 4px;
        margin-top: -45px;
        margin-bottom: 20px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    }

    /*little-profile*/
    .little-profile .pro-img {
        margin-bottom: 20px;
    }

    .little-profile .pro-img img {
        width: 128px;
        height: 128px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        border-radius: 100%;
    }

    .little-profile .soc-pro a {
        color: #99abb4;
    }

    .contact-box {
        position: relative;
    }

    .contact-box .add-ct-btn {
        position: absolute;
        right: 4px;
        top: -46px;
    }

    .contact-box .contact-widget > a {
        padding: 15px 10px;
    }

    .contact-box .contact-widget > a .user-img {
        margin-bottom: 0px !important;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @media (min-width: 1600px) {
        .col-xlg-1,
        .col-xlg-10,
        .col-xlg-11,
        .col-xlg-12,
        .col-xlg-2,
        .col-xlg-3,
        .col-xlg-4,
        .col-xlg-5,
        .col-xlg-6,
        .col-xlg-7,
        .col-xlg-8,
        .col-xlg-9 {
            float: left;
        }

        .col-xlg-12 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 100%;
            flex: 0 0 100%;
            max-width: 100%;
        }

        .col-xlg-11 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 91.66666667%;
            flex: 0 0 91.66666667%;
            max-width: 91.66666667%;
        }

        .col-xlg-10 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 83.33333333%;
            flex: 0 0 83.33333333%;
            max-width: 83.33333333%;
        }

        .col-xlg-9 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 75%;
            flex: 0 0 75%;
            max-width: 75%;
        }

        .col-xlg-8 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 66.66666667%;
            flex: 0 0 66.66666667%;
            max-width: 66.66666667%;
        }

        .col-xlg-7 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 58.33333333%;
            flex: 0 0 58.33333333%;
            max-width: 58.33333333%;
        }

        .col-xlg-6 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 50%;
            flex: 0 0 50%;
            max-width: 50%;
        }

        .col-xlg-5 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 41.66666667%;
            flex: 0 0 41.66666667%;
            max-width: 41.66666667%;
        }

        .col-xlg-4 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 33.33333333%;
            flex: 0 0 33.33333333%;
            max-width: 33.33333333%;
        }

        .col-xlg-3 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 25%;
            flex: 0 0 25%;
            max-width: 25%;
        }

        .col-xlg-2 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 16.66666667%;
            flex: 0 0 16.66666667%;
            max-width: 16.66666667%;
        }

        .col-xlg-1 {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 8.33333333%;
            flex: 0 0 8.33333333%;
            max-width: 8.33333333%;
        }

        .col-xlg-pull-12 {
            right: 100%;
        }

        .col-xlg-pull-11 {
            right: 91.66666667%;
        }

        .col-xlg-pull-10 {
            right: 83.33333333%;
        }

        .col-xlg-pull-9 {
            right: 75%;
        }

        .col-xlg-pull-8 {
            right: 66.66666667%;
        }

        .col-xlg-pull-7 {
            right: 58.33333333%;
        }

        .col-xlg-pull-6 {
            right: 50%;
        }

        .col-xlg-pull-5 {
            right: 41.66666667%;
        }

        .col-xlg-pull-4 {
            right: 33.33333333%;
        }

        .col-xlg-pull-3 {
            right: 25%;
        }

        .col-xlg-pull-2 {
            right: 16.66666667%;
        }

        .col-xlg-pull-1 {
            right: 8.33333333%;
        }

        .col-xlg-pull-0 {
            right: auto;
        }

        .col-xlg-push-12 {
            left: 100%;
        }

        .col-xlg-push-11 {
            left: 91.66666667%;
        }

        .col-xlg-push-10 {
            left: 83.33333333%;
        }

        .col-xlg-push-9 {
            left: 75%;
        }

        .col-xlg-push-8 {
            left: 66.66666667%;
        }

        .col-xlg-push-7 {
            left: 58.33333333%;
        }

        .col-xlg-push-6 {
            left: 50%;
        }

        .col-xlg-push-5 {
            left: 41.66666667%;
        }

        .col-xlg-push-4 {
            left: 33.33333333%;
        }

        .col-xlg-push-3 {
            left: 25%;
        }

        .col-xlg-push-2 {
            left: 16.66666667%;
        }

        .col-xlg-push-1 {
            left: 8.33333333%;
        }

        .col-xlg-push-0 {
            left: auto;
        }

        .offset-xlg-12 {
            margin-left: 100%;
        }

        .offset-xlg-11 {
            margin-left: 91.66666667%;
        }

        .offset-xlg-10 {
            margin-left: 83.33333333%;
        }

        .offset-xlg-9 {
            margin-left: 75%;
        }

        .offset-xlg-8 {
            margin-left: 66.66666667%;
        }

        .offset-xlg-7 {
            margin-left: 58.33333333%;
        }

        .offset-xlg-6 {
            margin-left: 50%;
        }

        .offset-xlg-5 {
            margin-left: 41.66666667%;
        }

        .offset-xlg-4 {
            margin-left: 33.33333333%;
        }

        .offset-xlg-3 {
            margin-left: 25%;
        }

        .offset-xlg-2 {
            margin-left: 16.66666667%;
        }

        .offset-xlg-1 {
            margin-left: 8.33333333%;
        }

        .offset-xlg-0 {
            margin-left: 0;
        }
    }

    .col-xlg-1,
    .col-xlg-10,
    .col-xlg-11,
    .col-xlg-12,
    .col-xlg-2,
    .col-xlg-3,
    .col-xlg-4,
    .col-xlg-5,
    .col-xlg-6,
    .col-xlg-7,
    .col-xlg-8,
    .col-xlg-9 {
        position: relative;
        min-height: 1px;
        padding-right: 15px;
        padding-left: 15px;
    }

    /*-------------------*/
    /*Bootstrap 4 hack*/
    /*-------------------*/
    .bootstrap-touchspin .input-group-btn {
        -webkit-box-align: normal;
        -ms-flex-align: normal;
        align-items: normal;
    }

    .form-control-danger, .form-control-success, .form-control-warning {
        padding-right: 2.25rem;
        background-repeat: no-repeat;
        background-position: center right .5625rem;
        background-size: 1.125rem 1.125rem;
    }

    .has-success .col-form-label, .has-success .custom-control, .has-success .form-check-label, .has-success .form-control-feedback, .has-success .form-control-label {
        color: #06d79c;
    }

    .has-success .form-control-success {
        background-image: url(success.23b0f3eae144671bfe43.svg);
    }

    .has-success .form-control {
        border-color: #06d79c;
    }

    .has-warning .col-form-label, .has-warning .custom-control, .has-warning .form-check-label, .has-warning .form-control-feedback, .has-warning .form-control-label {
        color: #ffb22b;
    }

    .has-warning .form-control-warning {
        background-image: url(warning.16fea764bb6e2f80c9cd.svg);
    }

    .has-warning .form-control {
        border-color: #ffb22b;
    }

    .has-danger .col-form-label, .has-danger .custom-control, .has-danger .form-check-label, .has-danger .form-control-feedback, .has-danger .form-control-label {
        color: #ef5350;
    }

    .has-danger .form-control-danger {
        background-image: url(danger.43c4f344f1e8c181d9e8.svg);
    }

    .has-danger .form-control {
        border-color: #ef5350;
    }

    .input-group-addon [type="radio"]:not(:checked),
    .input-group-addon [type="radio"]:checked,
    .input-group-addon [type="checkbox"]:not(:checked),
    .input-group-addon [type="checkbox"]:checked {
        position: initial;
        opacity: 1;
    }

    .invisible {
        visibility: hidden !important;
    }

    .hidden-xs-up {
        display: none !important;
    }

    @media (max-width: 575px) {
        .hidden-xs-down {
            display: none !important;
        }
    }

    @media (min-width: 576px) {
        .hidden-sm-up {
            display: none !important;
        }
    }

    @media (max-width: 767px) {
        .hidden-sm-down {
            display: none !important;
        }
    }

    @media (min-width: 768px) {
        .hidden-md-up {
            display: none !important;
        }
    }

    @media (max-width: 991px) {
        .hidden-md-down {
            display: none !important;
        }
    }

    @media (min-width: 992px) {
        .hidden-lg-up {
            display: none !important;
        }
    }

    @media (max-width: 1199px) {
        .hidden-lg-down {
            display: none !important;
        }
    }

    @media (min-width: 1200px) {
        .hidden-xl-up {
            display: none !important;
        }
    }

    .hidden-xl-down {
        display: none !important;
    }

    .card-inverse .card-blockquote,
    .card-inverse .card-footer,
    .card-inverse .card-header,
    .card-inverse .card-title {
        color: #ffffff;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*==============================================================
 For Laptop & above all (1650px)
 ============================================================== */
    @media (min-width: 1650px) {
        .widget-app-columns {
            -webkit-column-count: 3;
            column-count: 3;
        }
    }

    /*==============================================================
 For Laptop & above all (1370px)
 ============================================================== */
    @media (max-width: 1370px) {
        .widget-app-columns {
            -webkit-column-count: 2;
            column-count: 2;
        }
    }

    /*-- ==============================================================
 Small Desktop & above all (1024px)
 ============================================================== */
    @media (min-width: 1024px) {
        .page-wrapper {
            margin-left: 240px;
        }

        .footer {
            left: 240px;
        }
    }

    @media (max-width: 1023px) {
        .widget-app-columns {
            -webkit-column-count: 1;
            column-count: 1;
        }
    }

    /*-- ==============================================================
 Ipad & above all(768px)
 ============================================================== */
    @media (min-width: 768px) {
        .navbar-header {
            width: 240px;
            -ms-flex-negative: 0;
            flex-shrink: 0;
        }

        .navbar-header .navbar-brand {
            padding-top: 0px;
        }

        /*This is for the breeadcrumd*/
        .page-titles .breadcrumb {
            float: right;
        }

        .card-group .card:first-child, .card-group .card:not(:first-child):not(:last-child) {
            border-right: 1px solid rgba(0, 0, 0, 0.03);
        }

        .material-icon-list-demo .icons div {
            width: 33%;
            padding: 15px;
            display: inline-block;
            line-height: 40px;
        }

        .mini-sidebar .page-wrapper {
            margin-left: 70px;
        }

        .mini-sidebar .footer {
            left: 70px;
        }

        .flex-wrap {
            -ms-flex-wrap: nowrap !important;
            flex-wrap: nowrap !important;
            -webkit-flex-wrap: nowrap !important;
        }

        .navbar-expand-md .navbar-nav .dropdown-menu-right {
            left: auto !important;
        }
    }

    /*-- ==============================================================
 Phone and below ipad(767px)
 ============================================================== */
    @media (max-width: 767px) {
        /*Header*/
        .topbar {
            width: 100%;
        }

        .topbar .top-navbar {
            padding-right: 15px;
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
            -ms-flex-wrap: nowrap;
            flex-wrap: nowrap;
            -webkit-align-items: center;
        }

        .topbar .top-navbar .navbar-collapse {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            width: 100%;
        }

        .topbar .top-navbar .navbar-header {
            width: 70px;
        }

        .topbar .top-navbar .navbar-brand span {
            display: none;
        }

        .topbar .top-navbar .navbar-nav {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        }

        .topbar .top-navbar .navbar-nav > .nav-item.show {
            position: static;
        }

        .topbar .top-navbar .navbar-nav > .nav-item.show .dropdown-menu {
            width: 100%;
            margin-top: 0px;
            left: 0 !important;
            right: 0 !important;
        }

        .topbar .top-navbar .navbar-nav > .nav-item > .nav-link {
            padding-left: .50rem;
            padding-right: .50rem;
        }

        .topbar .top-navbar .navbar-nav .dropdown-menu {
            position: absolute;
        }

        .mega-dropdown .dropdown-menu {
            height: 480px;
            overflow: auto;
        }

        /*Sidebar and wrapper*/
        .mini-sidebar .page-wrapper {
            margin-left: 0px;
        }

        .comment-text .comment-footer .action-icons {
            display: block;
            padding: 10px 0;
        }

        /*Footer*/
        .footer {
            left: 0px;
        }

        .material-icon-list-demo .icons div {
            width: 100%;
        }

        .error-page .footer {
            position: fixed;
            bottom: 0px;
            z-index: 10;
        }

        .error-box {
            position: relative;
            padding-bottom: 60px;
        }

        .error-body {
            padding-top: 10%;
        }

        .error-body h1 {
            font-size: 100px;
            font-weight: 600;
            line-height: 100px;
        }

        .login-register {
            position: relative;
            overflow: hidden;
        }

        .login-box {
            width: 90%;
        }

        .login-sidebar {
            padding: 10% 0;
        }

        .login-sidebar .login-box {
            position: relative;
        }

        /*Timeline*/
        ul.timeline:before {
            left: 40px;
        }

        ul.timeline > li > .timeline-panel {
            width: calc(100% - 90px);
        }

        ul.timeline > li > .timeline-badge {
            top: 16px;
            left: 15px;
            margin-left: 0;
        }

        ul.timeline > li > .timeline-panel {
            float: right;
        }

        ul.timeline > li > .timeline-panel:before {
            right: auto;
            left: -15px;
            border-right-width: 15px;
            border-left-width: 0;
        }

        ul.timeline > li > .timeline-panel:after {
            right: auto;
            left: -14px;
            border-right-width: 14px;
            border-left-width: 0;
        }
    }

    .preloader {
        position: absolute;
        margin: 0 auto;
        width: 100%;
        height: 100%;
    }

    .spinner {
        width: 40px;
        height: 40px;
        top: 35%;
        position: relative;
        margin: 100px auto;
    }

    .double-bounce1, .double-bounce2 {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #1976d2;
        opacity: 0.6;
        position: absolute;
        top: 0;
        left: 0;
        -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
        animation: sk-bounce 2.0s infinite ease-in-out;
    }

    .double-bounce2 {
        -webkit-animation-delay: -1.0s;
        animation-delay: -1.0s;
    }

    @-webkit-keyframes sk-bounce {
        0%, 100% {
            -webkit-transform: scale(0);
        }
        50% {
            -webkit-transform: scale(1);
        }
    }

    @keyframes sk-bounce {
        0%, 100% {
            transform: scale(0);
            -webkit-transform: scale(0);
        }
        50% {
            transform: scale(1);
            -webkit-transform: scale(1);
        }
    }

    @media (min-width: 769px) {
        .horizontal-nav {
            /*This is for the navigation*/
            /*This is for the page wrapper*/
        }

        .horizontal-nav .left-sidebar {
            position: relative;
            width: 100%;
            height: auto;
            padding-top: 0px;
        }

        .horizontal-nav .scroll-sidebar {
            height: auto;
        }

        .horizontal-nav .sidebar-nav {
            padding: 0px 15px;
        }

        .horizontal-nav .sidebar-nav #sidebarnav {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
        }

        .horizontal-nav .sidebar-nav #sidebarnav li {
            position: relative;
        }

        .horizontal-nav .sidebar-nav #sidebarnav li a {
            padding: 12px 15px;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li {
            display: inline-block;
            margin-bottom: 0px;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li:hover > a {
            background: #edf0f5;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li:last-child > ul {
            right: 0px;
            left: auto;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li > a.two-column + ul {
            width: 400px;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li > a.two-column + ul > li {
            display: inline-block;
            width: 49%;
            vertical-align: top;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li > ul {
            position: absolute;
            left: 0px;
            top: 59px;
            width: 220px;
            max-height: 350px;
            overflow-y: auto;
            padding-bottom: 10px;
            z-index: 1001;
            background: #edf0f5;
            display: none;
            padding-left: 1px;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li:hover > ul {
            height: auto !important;
            overflow: auto;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li:hover > ul,
        .horizontal-nav .sidebar-nav #sidebarnav > li:hover > ul.collapse {
            display: block;
        }

        .horizontal-nav .sidebar-nav #sidebarnav > li > a.has-arrow:after {
            display: none;
        }

        .horizontal-nav .sidebar-nav #sidebarnav .nav-small-cap,
        .horizontal-nav .sidebar-nav #sidebarnav .sidebar-footer,
        .horizontal-nav .sidebar-nav #sidebarnav .user-profile .profile-text,
        .horizontal-nav .sidebar-nav #sidebarnav > .label {
            display: none;
        }

        .horizontal-nav .navbar-header {
            padding-left: 15px;
        }

        .horizontal-nav .page-wrapper {
            margin-left: 0px;
            height: calc(100vh - 160px);
        }

        .horizontal-nav .footer {
            left: 0px;
        }

        .horizontal-nav .page-titles {
            background: transparent !important;
            box-shadow: none;
        }
    }

    @media (min-width: 1400px) {
        .boxed .topbar .top-navbar, .boxed .sidebar-nav, .boxed .container-fluid, .boxed .page-titles {
            max-width: 1600px;
            margin: 0 auto;
        }

        .boxed .footer {
            text-align: center;
        }
    }

    @media (max-width: 768px) {
        .mini-sidebar .left-sidebar,
        .mini-sidebar .sidebar-footer {
            left: -240px;
        }

        .mini-sidebar .page-wrapper {
            margin-left: 0px;
        }

        .mini-sidebar .footer {
            left: 0px;
        }

        .scroll-sidebar {
            overflow: auto;
        }
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .bluedark {
        /*******************
  /*Top bar
  *******************/
        /*******************
/*General Elements
*******************/
        /*******************
/*Buttons
*******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .bluedark .topbar {
        background: #1e88e5;
    }

    .bluedark .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .bluedark .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .bluedark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .bluedark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .bluedark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: #ffffff !important;
    }

    .bluedark .topbar .navbar-header {
        background: #1e88e5;
    }

    .bluedark .logo-center .topbar .navbar-header {
        background: transparent;
        box-shadow: none;
    }

    .bluedark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .bluedark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .bluedark a.link:hover, .bluedark a.link:focus {
        color: #1e88e5 !important;
    }

    .bluedark .right-sidebar .rpanel-title {
        background: #1e88e5;
    }

    .bluedark .text-themecolor {
        color: #1e88e5 !important;
    }

    .bluedark .btn-themecolor,
    .bluedark .btn-themecolor.disabled {
        background: #1e88e5;
        color: #ffffff;
        border: 1px solid #1e88e5;
    }

    .bluedark .btn-themecolor:hover,
    .bluedark .btn-themecolor.disabled:hover {
        background: #1e88e5;
        opacity: 0.7;
        border: 1px solid #1e88e5;
    }

    .bluedark .btn-themecolor.active, .bluedark .btn-themecolor:focus,
    .bluedark .btn-themecolor.disabled.active,
    .bluedark .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .bluedark .left-sidebar,
    .bluedark .card-no-border .left-sidebar,
    .bluedark .card-no-border .sidebar-nav {
        background: #272c33;
    }

    .bluedark .user-profile .profile-text a {
        color: #798699 !important;
    }

    .bluedark .card-no-border .sidebar-footer {
        background: #181c22;
    }

    .bluedark .label-themecolor {
        background: #1e88e5;
    }

    .bluedark .sidebar-nav > ul > li.active > a {
        color: #1e88e5;
        border-color: #1e88e5;
    }

    .bluedark .sidebar-nav > ul > li.active > a i {
        color: #1e88e5;
    }

    .bluedark .sidebar-nav ul li a.router-link-active, .bluedark .sidebar-nav ul li a:hover {
        color: #1e88e5;
    }

    .bluedark .sidebar-nav ul li a.router-link-active i, .bluedark .sidebar-nav ul li a:hover i {
        color: #1e88e5;
    }

    .bluedark .sidebar-nav ul li.nav-small-cap {
        color: #798699;
    }

    @media (min-width: 768px) {
        .bluedark.horizontal-nav .sidebar-nav #sidebarnav > li > ul {
            background: #181c22;
        }

        .bluedark.horizontal-nav .sidebar-nav #sidebarnav > li:hover > a {
            background: #181c22;
        }
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    .defaultdark {
        /*******************
  /*Top bar
  *******************/
        /*******************
/*General Elements
*******************/
        /*******************
/*Buttons
*******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .defaultdark .topbar {
        background: #fff;
    }

    .defaultdark .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: none;
    }

    .defaultdark .topbar .top-navbar .navbar-nav > .nav-item > span {
        color: #398bf7;
    }

    .defaultdark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #a6b7bf;
    }

    .defaultdark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .defaultdark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: #242a33 !important;
    }

    .defaultdark .logo-center .topbar .navbar-header {
        background: transparent;
        box-shadow: none;
    }

    .defaultdark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .defaultdark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .defaultdark a.link:hover, .defaultdark a.link:focus {
        color: #398bf7 !important;
    }

    .defaultdark .right-sidebar .rpanel-title {
        background: #398bf7;
    }

    .defaultdark .text-themecolor {
        color: #398bf7 !important;
    }

    .defaultdark .btn-themecolor,
    .defaultdark .btn-themecolor.disabled {
        background: #398bf7;
        color: #ffffff;
        border: 1px solid #398bf7;
    }

    .defaultdark .btn-themecolor:hover,
    .defaultdark .btn-themecolor.disabled:hover {
        background: #398bf7;
        opacity: 0.7;
        border: 1px solid #398bf7;
    }

    .defaultdark .btn-themecolor.active, .defaultdark .btn-themecolor:focus,
    .defaultdark .btn-themecolor.disabled.active,
    .defaultdark .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .defaultdark .left-sidebar,
    .defaultdark .card-no-border .left-sidebar,
    .defaultdark .card-no-border .sidebar-nav {
        background: #242a33;
    }

    .defaultdark .user-profile .profile-text a {
        color: #687384 !important;
    }

    .defaultdark .card-no-border .sidebar-footer {
        background: #1c2128;
    }

    .defaultdark .label-themecolor {
        background: #398bf7;
    }

    .defaultdark .sidebar-nav > ul > li.active > a {
        color: #398bf7;
        border-color: #398bf7;
    }

    .defaultdark .sidebar-nav > ul > li.active > a i {
        color: #398bf7;
    }

    .defaultdark .sidebar-nav ul li a.router-link-active, .defaultdark .sidebar-nav ul li a:hover {
        color: #398bf7;
    }

    .defaultdark .sidebar-nav ul li a.router-link-active i, .defaultdark .sidebar-nav ul li a:hover i {
        color: #398bf7;
    }

    .defaultdark .sidebar-nav ul li.nav-small-cap {
        color: #687384;
    }

    @media (min-width: 768px) {
        .defaultdark.horizontal-nav .sidebar-nav #sidebarnav > li > ul {
            background: #1c2128;
        }

        .defaultdark.horizontal-nav .sidebar-nav #sidebarnav > li:hover > a {
            background: #1c2128;
        }
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .reddark {
        /*******************
  /*Top bar
  *******************/
        /*******************
/*General Elements
*******************/
        /*******************
/*Buttons
*******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .reddark .topbar {
        background: #f62d51;
    }

    .reddark .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .reddark .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .reddark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .reddark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .reddark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: #ffffff !important;
    }

    .reddark .topbar .navbar-header {
        background: #f62d51;
    }

    .reddark .logo-center .topbar .navbar-header {
        background: transparent;
        box-shadow: none;
    }

    .reddark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .reddark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .reddark a.link:hover, .reddark a.link:focus {
        color: #f62d51 !important;
    }

    .reddark .right-sidebar .rpanel-title {
        background: #f62d51;
    }

    .reddark .text-themecolor {
        color: #f62d51 !important;
    }

    .reddark .btn-themecolor,
    .reddark .btn-themecolor.disabled {
        background: #f62d51;
        color: #ffffff;
        border: 1px solid #f62d51;
    }

    .reddark .btn-themecolor:hover,
    .reddark .btn-themecolor.disabled:hover {
        background: #f62d51;
        opacity: 0.7;
        border: 1px solid #f62d51;
    }

    .reddark .btn-themecolor.active, .reddark .btn-themecolor:focus,
    .reddark .btn-themecolor.disabled.active,
    .reddark .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .reddark .left-sidebar,
    .reddark .card-no-border .left-sidebar,
    .reddark .card-no-border .sidebar-nav {
        background: #272c33;
    }

    .reddark .user-profile .profile-text a {
        color: #798699 !important;
    }

    .reddark .card-no-border .sidebar-footer {
        background: #181c22;
    }

    .reddark .label-themecolor {
        background: #f62d51;
    }

    .reddark .sidebar-nav > ul > li.active > a {
        color: #f62d51;
        border-color: #f62d51;
    }

    .reddark .sidebar-nav > ul > li.active > a i {
        color: #f62d51;
    }

    .reddark .sidebar-nav ul li a.router-link-active, .reddark .sidebar-nav ul li a:hover {
        color: #f62d51;
    }

    .reddark .sidebar-nav ul li a.router-link-active i, .reddark .sidebar-nav ul li a:hover i {
        color: #f62d51;
    }

    .reddark .sidebar-nav ul li.nav-small-cap {
        color: #798699;
    }

    @media (min-width: 768px) {
        .reddark.horizontal-nav .sidebar-nav #sidebarnav > li > ul {
            background: #181c22;
        }

        .reddark.horizontal-nav .sidebar-nav #sidebarnav > li:hover > a {
            background: #181c22;
        }
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .greendark {
        /*******************
  /*Top bar
  *******************/
        /*******************
/*General Elements
*******************/
        /*******************
/*Buttons
*******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .greendark .topbar {
        background: #00acc1;
    }

    .greendark .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .greendark .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .greendark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .greendark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .greendark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: #ffffff !important;
    }

    .greendark .topbar .navbar-header {
        background: #00acc1;
    }

    .greendark .logo-center .topbar .navbar-header {
        background: transparent;
        box-shadow: none;
    }

    .greendark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .greendark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .greendark a.link:hover, .greendark a.link:focus {
        color: #00acc1 !important;
    }

    .greendark .right-sidebar .rpanel-title {
        background: #00acc1;
    }

    .greendark .text-themecolor {
        color: #00acc1 !important;
    }

    .greendark .btn-themecolor,
    .greendark .btn-themecolor.disabled {
        background: #00acc1;
        color: #ffffff;
        border: 1px solid #00acc1;
    }

    .greendark .btn-themecolor:hover,
    .greendark .btn-themecolor.disabled:hover {
        background: #00acc1;
        opacity: 0.7;
        border: 1px solid #00acc1;
    }

    .greendark .btn-themecolor.active, .greendark .btn-themecolor:focus,
    .greendark .btn-themecolor.disabled.active,
    .greendark .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .greendark .left-sidebar,
    .greendark .card-no-border .left-sidebar,
    .greendark .card-no-border .sidebar-nav {
        background: #272c33;
    }

    .greendark .user-profile .profile-text a {
        color: #798699 !important;
    }

    .greendark .card-no-border .sidebar-footer {
        background: #181c22;
    }

    .greendark .label-themecolor {
        background: #00acc1;
    }

    .greendark .sidebar-nav > ul > li.active > a {
        color: #00acc1;
        border-color: #00acc1;
    }

    .greendark .sidebar-nav > ul > li.active > a i {
        color: #00acc1;
    }

    .greendark .sidebar-nav ul li a.router-link-active, .greendark .sidebar-nav ul li a:hover {
        color: #00acc1;
    }

    .greendark .sidebar-nav ul li a.router-link-active i, .greendark .sidebar-nav ul li a:hover i {
        color: #00acc1;
    }

    .greendark .sidebar-nav ul li.nav-small-cap {
        color: #798699;
    }

    @media (min-width: 768px) {
        .greendark.horizontal-nav .sidebar-nav #sidebarnav > li > ul {
            background: #181c22;
        }

        .greendark.horizontal-nav .sidebar-nav #sidebarnav > li:hover > a {
            background: #181c22;
        }
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .purpledark {
        /*******************
  /*Top bar
  *******************/
        /*******************
/*General Elements
*******************/
        /*******************
/*Buttons
*******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .purpledark .topbar {
        background: #7460ee;
    }

    .purpledark .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .purpledark .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .purpledark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .purpledark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .purpledark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: #ffffff !important;
    }

    .purpledark .topbar .navbar-header {
        background: #7460ee;
    }

    .purpledark .logo-center .topbar .navbar-header {
        background: transparent;
        box-shadow: none;
    }

    .purpledark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .purpledark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .purpledark a.link:hover, .purpledark a.link:focus {
        color: #7460ee !important;
    }

    .purpledark .right-sidebar .rpanel-title {
        background: #7460ee;
    }

    .purpledark .text-themecolor {
        color: #7460ee !important;
    }

    .purpledark .btn-themecolor,
    .purpledark .btn-themecolor.disabled {
        background: #7460ee;
        color: #ffffff;
        border: 1px solid #7460ee;
    }

    .purpledark .btn-themecolor:hover,
    .purpledark .btn-themecolor.disabled:hover {
        background: #7460ee;
        opacity: 0.7;
        border: 1px solid #7460ee;
    }

    .purpledark .btn-themecolor.active, .purpledark .btn-themecolor:focus,
    .purpledark .btn-themecolor.disabled.active,
    .purpledark .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .purpledark .left-sidebar,
    .purpledark .card-no-border .left-sidebar,
    .purpledark .card-no-border .sidebar-nav {
        background: #272c33;
    }

    .purpledark .user-profile .profile-text a {
        color: #798699 !important;
    }

    .purpledark .card-no-border .sidebar-footer {
        background: #181c22;
    }

    .purpledark .label-themecolor {
        background: #7460ee;
    }

    .purpledark .sidebar-nav > ul > li.active > a {
        color: #7460ee;
        border-color: #7460ee;
    }

    .purpledark .sidebar-nav > ul > li.active > a i {
        color: #7460ee;
    }

    .purpledark .sidebar-nav ul li a.router-link-active, .purpledark .sidebar-nav ul li a:hover {
        color: #7460ee;
    }

    .purpledark .sidebar-nav ul li a.router-link-active i, .purpledark .sidebar-nav ul li a:hover i {
        color: #7460ee;
    }

    .purpledark .sidebar-nav ul li.nav-small-cap {
        color: #798699;
    }

    @media (min-width: 768px) {
        .purpledark.horizontal-nav .sidebar-nav #sidebarnav > li > ul {
            background: #181c22;
        }

        .purpledark.horizontal-nav .sidebar-nav #sidebarnav > li:hover > a {
            background: #181c22;
        }
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .megnadark {
        /*******************
  /*Top bar
  *******************/
        /*******************
/*General Elements
*******************/
        /*******************
/*Buttons
*******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .megnadark .topbar {
        background: #00897b;
    }

    .megnadark .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .megnadark .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .megnadark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .megnadark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .megnadark .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: #ffffff !important;
    }

    .megnadark .topbar .navbar-header {
        background: #00897b;
    }

    .megnadark .logo-center .topbar .navbar-header {
        background: transparent;
        box-shadow: none;
    }

    .megnadark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .megnadark .logo-center .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .megnadark a.link:hover, .megnadark a.link:focus {
        color: #00897b !important;
    }

    .megnadark .right-sidebar .rpanel-title {
        background: #00897b;
    }

    .megnadark .text-themecolor {
        color: #00897b !important;
    }

    .megnadark .btn-themecolor,
    .megnadark .btn-themecolor.disabled {
        background: #00897b;
        color: #ffffff;
        border: 1px solid #00897b;
    }

    .megnadark .btn-themecolor:hover,
    .megnadark .btn-themecolor.disabled:hover {
        background: #00897b;
        opacity: 0.7;
        border: 1px solid #00897b;
    }

    .megnadark .btn-themecolor.active, .megnadark .btn-themecolor:focus,
    .megnadark .btn-themecolor.disabled.active,
    .megnadark .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .megnadark .left-sidebar,
    .megnadark .card-no-border .left-sidebar,
    .megnadark .card-no-border .sidebar-nav {
        background: #272c33;
    }

    .megnadark .user-profile .profile-text a {
        color: #798699 !important;
    }

    .megnadark .card-no-border .sidebar-footer {
        background: #181c22;
    }

    .megnadark .label-themecolor {
        background: #00897b;
    }

    .megnadark .sidebar-nav > ul > li.active > a {
        color: #00897b;
        border-color: #00897b;
    }

    .megnadark .sidebar-nav > ul > li.active > a i {
        color: #00897b;
    }

    .megnadark .sidebar-nav ul li a.router-link-active, .megnadark .sidebar-nav ul li a:hover {
        color: #00897b;
    }

    .megnadark .sidebar-nav ul li a.router-link-active i, .megnadark .sidebar-nav ul li a:hover i {
        color: #00897b;
    }

    .megnadark .sidebar-nav ul li.nav-small-cap {
        color: #798699;
    }

    @media (min-width: 768px) {
        .megnadark.horizontal-nav .sidebar-nav #sidebarnav > li > ul {
            background: #181c22;
        }

        .megnadark.horizontal-nav .sidebar-nav #sidebarnav > li:hover > a {
            background: #181c22;
        }
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .megna {
        /*******************
  /*Top bar
  *******************/
        /*******************
  /*General Elements
  *******************/
        /*******************
  /*Buttons
  *******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .megna .topbar {
        background: #00897b;
    }

    .megna .topbar .navbar-header {
        background: #00897b;
    }

    .megna .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .megna .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .megna .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #ffffff !important;
    }

    .megna .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .megna .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .megna a.link:hover, .megna a.link:focus {
        color: #00897b !important;
    }

    .megna .bg-theme {
        background-color: #00897b !important;
    }

    .megna .pagination > .active > a,
    .megna .pagination > .active > span,
    .megna .pagination > .active > a:hover,
    .megna .pagination > .active > span:hover,
    .megna .pagination > .active > a:focus,
    .megna .pagination > .active > span:focus {
        background-color: #00897b;
        border-color: #00897b;
    }

    .megna .right-sidebar .rpanel-title {
        background: #00897b;
    }

    .megna .stylish-table tbody tr:hover, .megna .stylish-table tbody tr.active {
        border-left: 4px solid #00897b;
    }

    .megna .text-themecolor {
        color: #00897b !important;
    }

    .megna .profile-tab li a.nav-link.active,
    .megna .customtab li a.nav-link.active {
        border-bottom: 2px solid #00897b;
        color: #00897b;
    }

    .megna .profile-tab li a.nav-link:hover,
    .megna .customtab li a.nav-link:hover {
        color: #00897b;
    }

    .megna .btn-themecolor,
    .megna .btn-themecolor.disabled {
        background: #00897b;
        color: #ffffff;
        border: 1px solid #00897b;
    }

    .megna .btn-themecolor:hover,
    .megna .btn-themecolor.disabled:hover {
        background: #00897b;
        opacity: 0.7;
        border: 1px solid #00897b;
    }

    .megna .btn-themecolor.active, .megna .btn-themecolor:focus,
    .megna .btn-themecolor.disabled.active,
    .megna .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .megna .label-themecolor {
        background: #00897b;
    }

    .megna .sidebar-nav > ul > li.active > a {
        color: #00897b;
        border-color: #00897b;
    }

    .megna .sidebar-nav > ul > li.active > a i {
        color: #00897b;
    }

    .megna .sidebar-nav ul li a.router-link-active, .megna .sidebar-nav ul li a:hover {
        color: #00897b;
    }

    .megna .sidebar-nav ul li a.router-link-active i, .megna .sidebar-nav ul li a:hover i {
        color: #00897b;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .blue {
        /*******************
  /*Top bar
  *******************/
        /*******************
  /*General Elements
  *******************/
        /*******************
  /*Buttons
  *******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .blue .topbar {
        background: #1976d2;
    }

    .blue .topbar .navbar-header {
        background: #1976d2;
    }

    .blue .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .blue .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .blue .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #ffffff !important;
    }

    .blue .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .blue .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .blue a.link:hover, .blue a.link:focus {
        color: #1976d2 !important;
    }

    .blue .bg-theme {
        background-color: #1976d2 !important;
    }

    .blue .pagination > .active > a,
    .blue .pagination > .active > span,
    .blue .pagination > .active > a:hover,
    .blue .pagination > .active > span:hover,
    .blue .pagination > .active > a:focus,
    .blue .pagination > .active > span:focus {
        background-color: #1976d2;
        border-color: #1976d2;
    }

    .blue .right-sidebar .rpanel-title {
        background: #1976d2;
    }

    .blue .stylish-table tbody tr:hover, .blue .stylish-table tbody tr.active {
        border-left: 4px solid #1976d2;
    }

    .blue .text-themecolor {
        color: #1976d2 !important;
    }

    .blue .profile-tab li a.nav-link.active,
    .blue .customtab li a.nav-link.active {
        border-bottom: 2px solid #1976d2;
        color: #1976d2;
    }

    .blue .profile-tab li a.nav-link:hover,
    .blue .customtab li a.nav-link:hover {
        color: #1976d2;
    }

    .blue .btn-themecolor,
    .blue .btn-themecolor.disabled {
        background: #1976d2;
        color: #ffffff;
        border: 1px solid #1976d2;
    }

    .blue .btn-themecolor:hover,
    .blue .btn-themecolor.disabled:hover {
        background: #1976d2;
        opacity: 0.7;
        border: 1px solid #1976d2;
    }

    .blue .btn-themecolor.active, .blue .btn-themecolor:focus,
    .blue .btn-themecolor.disabled.active,
    .blue .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .blue .label-themecolor {
        background: #1976d2;
    }

    .blue .sidebar-nav ul li a.router-link-active, .blue .sidebar-nav ul li a:hover {
        color: #1976d2;
    }

    .blue .sidebar-nav ul li a.router-link-active i, .blue .sidebar-nav ul li a:hover i {
        color: #1976d2;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .red {
        /*******************
  /*Top bar
  *******************/
        /*******************
  /*General Elements
  *******************/
        /*******************
  /*Buttons
  *******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .red .topbar {
        background: #f62d51;
    }

    .red .topbar .navbar-header {
        background: #f62d51;
    }

    .red .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .red .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .red .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #ffffff !important;
    }

    .red .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .red .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .red a.link:hover, .red a.link:focus {
        color: #f62d51 !important;
    }

    .red .bg-theme {
        background-color: #f62d51 !important;
    }

    .red .pagination > .active > a,
    .red .pagination > .active > span,
    .red .pagination > .active > a:hover,
    .red .pagination > .active > span:hover,
    .red .pagination > .active > a:focus,
    .red .pagination > .active > span:focus {
        background-color: #f62d51;
        border-color: #f62d51;
    }

    .red .right-sidebar .rpanel-title {
        background: #f62d51;
    }

    .red .stylish-table tbody tr:hover, .red .stylish-table tbody tr.active {
        border-left: 4px solid #f62d51;
    }

    .red .text-themecolor {
        color: #f62d51 !important;
    }

    .red .profile-tab li a.nav-link.active,
    .red .customtab li a.nav-link.active {
        border-bottom: 2px solid #f62d51;
        color: #f62d51;
    }

    .red .profile-tab li a.nav-link:hover,
    .red .customtab li a.nav-link:hover {
        color: #f62d51;
    }

    .red .btn-themecolor,
    .red .btn-themecolor.disabled {
        background: #f62d51;
        color: #ffffff;
        border: 1px solid #f62d51;
    }

    .red .btn-themecolor:hover,
    .red .btn-themecolor.disabled:hover {
        background: #f62d51;
        opacity: 0.7;
        border: 1px solid #f62d51;
    }

    .red .btn-themecolor.active, .red .btn-themecolor:focus,
    .red .btn-themecolor.disabled.active,
    .red .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .red .label-themecolor {
        background: #f62d51;
    }

    .red .sidebar-nav > ul > li.active > a {
        color: #f62d51;
        border-color: #f62d51;
    }

    .red .sidebar-nav > ul > li.active > a i {
        color: #f62d51;
    }

    .red .sidebar-nav ul li a.router-link-active, .red .sidebar-nav ul li a:hover {
        color: #f62d51;
    }

    .red .sidebar-nav ul li a.router-link-active i, .red .sidebar-nav ul li a:hover i {
        color: #f62d51;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .green {
        /*******************
  /*Top bar
  *******************/
        /*******************
  /*General Elements
  *******************/
        /*******************
  /*Buttons
  *******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .green .topbar {
        background: #00acc1;
    }

    .green .topbar .navbar-header {
        background: #00acc1;
    }

    .green .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .green .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .green .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #ffffff !important;
    }

    .green .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .green .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .green a.link:hover, .green a.link:focus {
        color: #00acc1 !important;
    }

    .green .bg-theme {
        background-color: #00acc1 !important;
    }

    .green .pagination > .active > a,
    .green .pagination > .active > span,
    .green .pagination > .active > a:hover,
    .green .pagination > .active > span:hover,
    .green .pagination > .active > a:focus,
    .green .pagination > .active > span:focus {
        background-color: #00acc1;
        border-color: #00acc1;
    }

    .green .right-sidebar .rpanel-title {
        background: #00acc1;
    }

    .green .stylish-table tbody tr:hover, .green .stylish-table tbody tr.active {
        border-left: 4px solid #00acc1;
    }

    .green .text-themecolor {
        color: #00acc1 !important;
    }

    .green .profile-tab li a.nav-link.active,
    .green .customtab li a.nav-link.active {
        border-bottom: 2px solid #00acc1;
        color: #00acc1;
    }

    .green .profile-tab li a.nav-link:hover,
    .green .customtab li a.nav-link:hover {
        color: #00acc1;
    }

    .green .btn-themecolor,
    .green .btn-themecolor.disabled {
        background: #00acc1;
        color: #ffffff;
        border: 1px solid #00acc1;
    }

    .green .btn-themecolor:hover,
    .green .btn-themecolor.disabled:hover {
        background: #00acc1;
        opacity: 0.7;
        border: 1px solid #00acc1;
    }

    .green .btn-themecolor.active, .green .btn-themecolor:focus,
    .green .btn-themecolor.disabled.active,
    .green .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .green .label-themecolor {
        background: #00acc1;
    }

    .green .sidebar-nav > ul > li.active > a {
        color: #00acc1;
        border-color: #00acc1;
    }

    .green .sidebar-nav > ul > li.active > a i {
        color: #00acc1;
    }

    .green .sidebar-nav ul li a.router-link-active, .green .sidebar-nav ul li a:hover {
        color: #00acc1;
    }

    .green .sidebar-nav ul li a.router-link-active i, .green .sidebar-nav ul li a:hover i {
        color: #00acc1;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .purple {
        /*******************
  /*Top bar
  *******************/
        /*******************
  /*General Elements
  *******************/
        /*******************
  /*Buttons
  *******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .purple .topbar {
        background: #7460ee;
    }

    .purple .topbar .navbar-header {
        background: #7460ee;
    }

    .purple .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .purple .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .purple .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #ffffff !important;
    }

    .purple .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .purple .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .purple a.link:hover, .purple a.link:focus {
        color: #7460ee !important;
    }

    .purple .bg-theme {
        background-color: #7460ee !important;
    }

    .purple .pagination > .active > a,
    .purple .pagination > .active > span,
    .purple .pagination > .active > a:hover,
    .purple .pagination > .active > span:hover,
    .purple .pagination > .active > a:focus,
    .purple .pagination > .active > span:focus {
        background-color: #7460ee;
        border-color: #7460ee;
    }

    .purple .right-sidebar .rpanel-title {
        background: #7460ee;
    }

    .purple .stylish-table tbody tr:hover, .purple .stylish-table tbody tr.active {
        border-left: 4px solid #7460ee;
    }

    .purple .text-themecolor {
        color: #7460ee !important;
    }

    .purple .profile-tab li a.nav-link.active,
    .purple .customtab li a.nav-link.active {
        border-bottom: 2px solid #7460ee;
        color: #7460ee;
    }

    .purple .profile-tab li a.nav-link:hover,
    .purple .customtab li a.nav-link:hover {
        color: #7460ee;
    }

    .purple .btn-themecolor,
    .purple .btn-themecolor.disabled {
        background: #7460ee;
        color: #ffffff;
        border: 1px solid #7460ee;
    }

    .purple .btn-themecolor:hover,
    .purple .btn-themecolor.disabled:hover {
        background: #7460ee;
        opacity: 0.7;
        border: 1px solid #7460ee;
    }

    .purple .btn-themecolor.active, .purple .btn-themecolor:focus,
    .purple .btn-themecolor.disabled.active,
    .purple .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .purple .label-themecolor {
        background: #7460ee;
    }

    .purple .sidebar-nav > ul > li.active > a {
        color: #7460ee;
        border-color: #7460ee;
    }

    .purple .sidebar-nav > ul > li.active > a i {
        color: #7460ee;
    }

    .purple .sidebar-nav ul li a.router-link-active, .purple .sidebar-nav ul li a:hover {
        color: #7460ee;
    }

    .purple .sidebar-nav ul li a.router-link-active i, .purple .sidebar-nav ul li a:hover i {
        color: #7460ee;
    }

    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    /*
Template Name: Admin Press Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: scss
*/
    @font-face {
        font-family: 'Product Sans';
        font-display: fallback;
        src: local("Product Sans"), url("https://fonts.googleapis.com/css?family=Product%20Sans:500,600,700");
    }

    /*Theme Colors*/
    /*bootstrap Color*/
    /*Light colors*/
    /*Normal Color*/
    /*Extra Variable*/
    /*Preloader*/
    .preloader {
        width: 100%;
        height: 100%;
        top: 0px;
        position: fixed;
        z-index: 99999;
        background: #fff;
    }

    .preloader .cssload-speeding-wheel {
        position: absolute;
        top: calc(50% - 3.5px);
        left: calc(50% - 3.5px);
    }

    .default {
        /*******************
  /*Top bar
  *******************/
        /*******************
  /*General Elements
  *******************/
        /*******************
  /*Buttons
  *******************/
        /*******************
  /*sidebar navigation
  *******************/
    }

    .default .topbar {
        background: #455a64;
    }

    .default .topbar .navbar-header {
        background: transparent;
    }

    .default .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .default .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .default .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #ffffff !important;
    }

    .default .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .default .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .default a.link:hover, .default a.link:focus {
        color: #009efb !important;
    }

    .default .bg-theme {
        background-color: #009efb !important;
    }

    .default .pagination > .active > a,
    .default .pagination > .active > span,
    .default .pagination > .active > a:hover,
    .default .pagination > .active > span:hover,
    .default .pagination > .active > a:focus,
    .default .pagination > .active > span:focus {
        background-color: #009efb;
        border-color: #009efb;
    }

    .default .right-sidebar .rpanel-title {
        background: #009efb;
    }

    .default .stylish-table tbody tr:hover, .default .stylish-table tbody tr.active {
        border-left: 4px solid #009efb;
    }

    .default .text-themecolor {
        color: #009efb !important;
    }

    .default .profile-tab li a.nav-link.active,
    .default .customtab li a.nav-link.active {
        border-bottom: 2px solid #009efb;
        color: #009efb;
    }

    .default .profile-tab li a.nav-link:hover,
    .default .customtab li a.nav-link:hover {
        color: #009efb;
    }

    .default .btn-themecolor,
    .default .btn-themecolor.disabled {
        background: #009efb;
        color: #ffffff;
        border: 1px solid #009efb;
    }

    .default .btn-themecolor:hover,
    .default .btn-themecolor.disabled:hover {
        background: #009efb;
        opacity: 0.7;
        border: 1px solid #009efb;
    }

    .default .btn-themecolor.active, .default .btn-themecolor:focus,
    .default .btn-themecolor.disabled.active,
    .default .btn-themecolor.disabled:focus {
        background: #028ee1;
    }

    .default .label-themecolor {
        background: #009efb;
    }

    .default .sidebar-nav > ul > li.active > a {
        color: #009efb;
        border-color: #009efb;
    }

    .default .sidebar-nav > ul > li.active > a i {
        color: #009efb;
    }

    .default .sidebar-nav ul li a.router-link-active, .default .sidebar-nav ul li a:hover {
        color: #009efb;
    }

    .default .sidebar-nav ul li a.router-link-active i, .default .sidebar-nav ul li a:hover i {
        color: #009efb;
    }

    /*
Template Name: Admin Press Admin
File: scss
*/
    .dark-theme {
        /*******************
/*Top bar
*******************/
        /*******************
/*General Elements
*******************/
        /*******************
/*sidebar navigation
*******************/
        /*******************
/* Light colors conversion
*******************/
        /*******************
/* General light colors font conversion
*******************/
        /*******************
/* Dark -alt conversion
*******************/
        /*******************
/* Dark  conversion
*******************/
        /*******************
/* Dark border conversion
*******************/
        /*******************
/* Dark -odd border conversion
*******************/
    }

    .dark-theme .topbar .top-navbar .navbar-header .navbar-brand .dark-logo {
        display: none;
    }

    .dark-theme .topbar .top-navbar .navbar-header .navbar-brand .light-logo {
        display: inline-block;
        color: rgba(255, 255, 255, 0.8);
    }

    .dark-theme .topbar .navbar-light .navbar-nav .nav-item > a.nav-link {
        color: #a6b7bf;
    }

    .dark-theme .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:hover, .dark-theme .topbar .navbar-light .navbar-nav .nav-item > a.nav-link:focus {
        color: #242a33 !important;
    }

    .dark-theme .topbar .navbar-header {
        background: #272c33;
    }

    .dark-theme a.link:hover, .dark-theme a.link:focus {
        color: #009efb !important;
    }

    .dark-theme .right-sidebar .rpanel-title {
        background: #009efb;
    }

    .dark-theme .text-themecolor {
        color: #009efb !important;
    }

    .dark-theme .left-sidebar,
    .dark-theme .card-no-border .left-sidebar,
    .dark-theme .card-no-border .sidebar-nav {
        background: #272c33;
    }

    .dark-theme .user-profile .profile-text a {
        color: #798699 !important;
    }

    .dark-theme .card-no-border .sidebar-footer {
        background: #181c22;
    }

    .dark-theme .label-themecolor {
        background: #009efb;
    }

    .dark-theme .sidebar-nav > ul > li.active > a {
        color: #009efb;
        border-color: #009efb;
    }

    .dark-theme .sidebar-nav > ul > li.active > a i {
        color: #009efb;
    }

    .dark-theme .sidebar-nav ul li.nav-small-cap {
        color: #798699;
    }

    @media (min-width: 768px) {
        .dark-theme.mini-sidebar .sidebar-nav #sidebarnav > li > ul {
            background: #181c22;
        }

        .dark-theme.mini-sidebar .sidebar-nav #sidebarnav > li:hover > a {
            background: #181c22;
        }
    }

    .dark-theme h1,
    .dark-theme h2,
    .dark-theme h3,
    .dark-theme h4,
    .dark-theme h5,
    .dark-theme h6 {
        color: #bbbbbb;
    }

    .dark-theme .todo-list li .checkbox label,
    .dark-theme .page-link,
    .dark-theme .list-group-item-action,
    .dark-theme .custom-select,
    .dark-theme .custom-file-control,
    .dark-theme .form-control:focus,
    .dark-theme .btn-light,
    .dark-theme .dropdown-menu,
    .dark-theme .navbar-light .navbar-nav .nav-link,
    .dark-theme .ngx-datatable.material .datatable-body .datatable-body-row .datatable-body-cell {
        color: #7d8b92;
    }

    .dark-theme .page-wrapper,
    .dark-theme .form-control,
    .dark-theme .progress,
    .dark-theme .page-item.disabled .page-link,
    .dark-theme .page-link,
    .dark-theme .btn-secondary,
    .dark-theme .btn-outline-secondary,
    .dark-theme .btn-secondary.disabled {
        background: #3d4554;
    }

    .dark-theme .custom-select,
    .dark-theme .custom-file-control,
    .dark-theme .mailbox .message-center a:hover,
    .dark-theme .mega-dropdown .nav-accordion .card-header,
    .dark-theme .table-striped tbody tr:nth-of-type(odd),
    .dark-theme .ngx-datatable.material {
        background-color: #3d4554;
    }

    .dark-theme .card,
    .dark-theme .list-group-item,
    .dark-theme .bg-white,
    .dark-theme .nav-tabs .nav-link.active,
    .dark-theme .btn-outline-primary {
        background: #272c33;
    }

    .dark-theme .form-control,
    .dark-theme .table td,
    .dark-theme .table th,
    .dark-theme .page-item.disabled .page-link,
    .dark-theme .page-link,
    .dark-theme .btn-secondary,
    .dark-theme .btn-secondary.disabled,
    .dark-theme .btn-outline-secondary,
    .dark-theme .cal-month-view .cal-day-cell:not(:last-child),
    .dark-theme .cal-month-view .cal-days .cal-cell-row,
    .dark-theme .cal-month-view .cal-days,
    .dark-theme .nav-tabs .nav-link.active,
    .dark-theme .nav-tabs,
    .dark-theme .dragndrop > div,
    .dark-theme .custom-select,
    .dark-theme .custom-file-control,
    .dark-theme .input-group-addon,
    .dark-theme .table-bordered {
        border-color: rgba(120, 130, 140, 0.13);
    }

    .dark-theme .card-default .card-header,
    .dark-theme .footer,
    .dark-theme .bg-light,
    .dark-theme .table-hover tbody tr:hover,
    .dark-theme .right-sidebar,
    .dark-theme .cal-month-view .cal-cell-row:hover,
    .dark-theme .cal-month-view .cal-cell-row .cal-cell:hover,
    .dark-theme .cal-month-view .cal-cell.cal-has-events.cal-open,
    .dark-theme .cal-month-view .cal-open-day-events,
    .dark-theme .cal-day-view .cal-hour:nth-child(odd),
    .dark-theme .taskboard .taskboard-task,
    .dark-theme .input-group-addon,
    .dark-theme .dropdown-menu {
        background: #1f2227 !important;
    }

    .dark-theme .page-titles {
        background: transparent;
    }
</style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }
}
