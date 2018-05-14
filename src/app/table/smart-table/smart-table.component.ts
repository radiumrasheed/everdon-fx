import {Component} from '@angular/core';
import * as tableData from './smart-data-table';
import {LocalDataSource} from 'ng2-smart-table';

@Component({
  templateUrl: './smart-table.component.html'
})
export class SmarttableComponent {
  source: LocalDataSource;
  settings = tableData.settings;
  settings2 = tableData.settings2;

  constructor() {
    this.source = new LocalDataSource(tableData.data); // create the source

  };
}
