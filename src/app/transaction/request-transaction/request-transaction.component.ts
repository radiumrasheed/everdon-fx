import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-request-transaction',
  templateUrl: './request-transaction.component.html',
  styleUrls: ['./request-transaction.component.css']
})
export class RequestTransactionComponent implements OnInit {

  powers = ['Really Smart', 'Super Flexible', 'Weather Changer'];
  hero = {name: 'Dr.', alterEgo: 'Dr. What', power: this.powers[0]};
  login = {username: '', password: ''};

  constructor() {
  }

  ngOnInit() {
  }

}
