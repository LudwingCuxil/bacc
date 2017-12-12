import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef} from '@angular/core';
import {isObject} from 'util';

@Component({
  selector: 'pl-data-table',
  templateUrl: './data-table.component.html',
  styles: [`
    li a.disabled {
      color: gray;
      cursor: not-allowed;
    }
    
    table.table-hover > tbody {
      cursor: pointer;
    } 
  `],
})
export class DataTableByteComponent implements OnInit, OnChanges {

  @Input() pager: any = {
    first: true,
    last: false,
    number: 0,
    numberOfElements: null,
    size: 5,
    sort: null,
    totalElements: 0,
    totalPages: 0
  };
  @Output() updatePagination = new EventEmitter();
  @Input() useTableTemplate = false;
  @Input() useServicePager = true;
  @Input() data: any[] = [];
  @Input() heading: string[];
  @Input() values: string[];
  @Input() actionTemplate: TemplateRef<any>;
  @Input() firstTemplate: TemplateRef<any>;
  @Input() mediumTemplate: TemplateRef<any>;
  @Input() bodyTemplate: TemplateRef<any>;
  @Input() headerTemplate: TemplateRef<any>;
  @Output() rowSelected = new EventEmitter();
  items: any[] = [];
  pages: number[] = [];
  pagesShow: number[] = [];
  numberOfItemsPager = 5;

  constructor() {
  }

  ngOnInit() {
    this.updateTable();
  }

  updateTable(): void {
    if (this.useServicePager) {
      return;
    }
    if (this.pager) {
      if (this.pager.number === 0) {
        this.pager.number = 1;
      }
      this.pager.totalElements = this.data.length;
      this.pager.totalPages = (this.pager.totalElements / this.pager.size);
      if (this.pager.number === 1) {
        this.pager.first = true;
      } else if (this.pager.number === this.pager.totalPages - 1) {
        this.pager.last = true;
      } else {
        this.pager.first = false;
        this.pager.last = false;
      }
      this.items = this.data.slice((this.pager.number - 1) * this.pager.size, (this.pager.number) * this.pager.size);
    } else {
      this.items = this.data;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pager'] !== undefined) {
      if (changes['pager'].currentValue !== undefined) {
        this.pager.number = this.pager.number + 1;
      }
    }

    if (changes['data'] !== undefined) {
      if (changes['data'].currentValue !== undefined) {
        this.data = changes['data'].currentValue;
        this.updateTable();
      }
    }
  }

  valueFormatter(row: any, field: string): string {
    if (field.split('.').length > 1) {
      const fields = field.split('.');
      let value = row;
      for (let i = 0; i < fields.length; i++) {
        if (value && isObject(value[fields[i]]) && value[fields[i]]) {
          value = value[fields[i]];
        } else if(value) {
          value = value[fields[i]];
        }
      }
      if (value) {
        return value;
      }
    } else {
      return row[field];
    }
    return '';
  }

  updatePage(rows: number) {
    this.pager.size = rows;
    this.updateTable();
    if (this.pager.size >= this.pager.totalElements) {
      this.pager.number = 0;
      this.updatePagination.emit(this.pager);
    } else {
      this.pageChange(null);
    }
    this.updateTable();
  }

  selectRow(obj: any) {
    this.rowSelected.emit(obj);
  }

  pageChange(event: any) {
    if (this.useServicePager) {
      this.pager.number = this.pager.number - 1;
    }
    this.updatePagination.emit(this.pager);
    this.updateTable();
  }
}
