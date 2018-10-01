import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
	selector: 'app-create-client',
	templateUrl: './create-client.component.html',
	styleUrls: ['./create-client.component.css']
})
export class CreateClientComponent implements OnInit {

	constructor(private router: Router) {
	}


	ngOnInit() {
	}


	onSubmittedSuccessfully() {
		this.router.navigate(['admin', 'transaction', 'request']).catch();
	}
}
