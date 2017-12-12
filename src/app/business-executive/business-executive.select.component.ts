import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import { BusinessExecutive } from "./shared/business-executive.model";
@Component({
  selector: 'pl-business-executive-select',
  templateUrl: './business-executive.select.component.html',
  styleUrls: ['./business-executive.select.component.css'],
  providers: [CatalogService]
})

export class BusinessExecutiveSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: BusinessExecutive[];
  @Input() businessExecutiveSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeBusinessExecutive: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() businessExecutive = new BusinessExecutive();
  @Input() business: string;
  businessExecutives: BusinessExecutive[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeBusinessExecutive = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'businessExecutive';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.descripcion && input.value.descripcion.length > 2) {
          return null;
        }
      }
    }
    return {
      'required': true
    };
  }

  ngOnInit() {
    if (!this.options && this.business) {
      this.catalogService.getCatalogParam('ejecutivosNegocio', 'empresa', this.business)
        .then((businessExecutives: any) => {
          this.businessExecutives = businessExecutives; 
          if (this.businessExecutive != null && this.businessExecutive.id.codigo != null) {
            const businessExecutiveFind = this.businessExecutives.find((item) => item.id.codigo === this.businessExecutive.id.codigo);
            this.businessExecutive = businessExecutiveFind;
          }
        });
    } else {
      this.businessExecutives = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: BusinessExecutive) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.businessExecutives.slice(0, 20);
      }
      if (terms.term) {
        return this.businessExecutives.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.businessExecutives.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['businessExecutiveSelected'] !== undefined) {
      if (changes['businessExecutiveSelected'].currentValue !== undefined && changes['businessExecutiveSelected'].currentValue !== null) {
        if (this.businessExecutives) {
          const businessExecutive = this.businessExecutives.find((item) => item.id.codigo === changes['businessExecutiveSelected'].currentValue);
          if (businessExecutive) {
            this.businessExecutive = businessExecutive;
          }
        }
      }
    }

    if (changes['businessExecutive'] !== undefined) {
      if (this.businessExecutives) {
        const businessExecutive = this.businessExecutives.find((item) => item.id.codigo === changes['businessExecutive'].currentValue.id.codigo);
        if (businessExecutive) {
          this.businessExecutive = businessExecutive;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeBusinessExecutive.emit(newObj.item);
    } else {
      this.changeBusinessExecutive.emit(newObj);
    }
  }

}
