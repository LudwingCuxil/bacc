import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import { Agency } from "./shared/agencies-select.model";
@Component({
  selector: 'pl-agencies-select',
  templateUrl: './agencies-select.component.html',
  styleUrls: ['./agencies-select.component.css'],
  providers: [CatalogService]
})

export class AgenciesSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Agency[];
  @Input() agencySelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeAgency: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() agency = new Agency();
  @Input() business: string = '';
  @Input() checkbook: false;
  agencies: Agency[] = [];
  agencyDefault: Agency = new Agency();
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeAgency = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'agency';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.nombre && input.value.nombre.length > 2) {
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
      this.catalogService.getCatalogParam('agencias/default', 'empresa', this.business)
      .then((agencyDefault) => {
        this.getAgency(agencyDefault);
      }).catch((e) => this.getAgency());
    } else {
      this.agencies = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }
  
  getAgency (agencyDefault? : Agency) {
    console.log(agencyDefault);
    this.catalogService.getCatalogParam('agencias', 'empresa', this.business)
      .then((agencies: any) => {
        this.agencies = agencies;
        if (!this.checkbook) {
          this.agencyDefault.id.empresa = this.business;
          this.agencyDefault.id.codigo = 0;
          this.agencyDefault.nombre = 'Direccion Cliente';
          this.agencies.splice(0, 0, JSON.parse(JSON.stringify(this.agencyDefault)));
        }
        if (this.agency != null && this.agency.id.codigo != null) {
          const agencyFind = this.agencies.find((item) => item.id.codigo === this.agency.id.codigo);
          this.agency = agencyFind;
          this.changeAgency.emit(this.agency);
        }
        if (!this.agency || this.agency.id.codigo === null && !this.checkbook){
          this.agency = this.agencies[0];
          this.changeAgency.emit(this.agency);
        }
        if (agencyDefault || agencyDefault != null) {
          this.agencyDefault = this.agencies.filter((item) => item.id.codigo === agencyDefault.id.codigo)[0];
          if (this.agencyDefault) {
            this.agencies.splice(this.agencies.indexOf(this.agencyDefault), 1);
            if (this.checkbook) {
              this.agencies.splice(0, 0, this.agencyDefault);
              if (this.agency.id.codigo === null || this.agency.id.codigo === 0) {
                this.agency = this.agencies[0];
                this.changeAgency.emit(this.agency);
              }
            } else {
              this.agencies.splice(1, 0, this.agencyDefault);
            }
          }
        }
      });
  }

  formatter = (result: Agency) =>
    result.nombre ? result.nombre : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.agencies.slice(0, 20);
      }
      if (terms.term) {
        return this.agencies.filter(v => v.nombre.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.agencies.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['agencySelected'] !== undefined) {
      if (changes['agencySelected'].currentValue !== undefined && changes['agencySelected'].currentValue !== null) {
        if (this.agencies) {
          const agency = this.agencies.find((item) => item.id.codigo === changes['agencySelected'].currentValue);
          if (agency) {
            this.agency = agency;
          }
        }
      }
    }

    if (changes['agency'] !== undefined) {
      if (this.agencies) {
        const agency = this.agencies.find((item) => item.id.codigo === changes['agency'].currentValue.id.codigo);
        if (agency) {
          this.agency = agency;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeAgency.emit(newObj.item);
    } else {
      this.changeAgency.emit(newObj);
    }
  }

}
