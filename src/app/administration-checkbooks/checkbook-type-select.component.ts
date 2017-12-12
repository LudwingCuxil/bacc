import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
//import {Nacionalidad} from '../shared/client/nacionalidad';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Salario} from '../shared/client/salario';
import {TipoChequera} from '../shared/account/checkbook-type';

@Component({
  selector: 'pl-checkbook-type-select',
  templateUrl: './checkbook-type-select.component.html',
  styleUrls: ['./checkbook-type-select.component.css'],
  providers: [CatalogService]
})

export class CheckbookTypeSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: TipoChequera[];
  @Input() checkbookTypeSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeCheckbookType: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() checkbookType = new TipoChequera();
  checkbookTypes: TipoChequera[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();
  @Input() currency: string;

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeCheckbookType = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'checkbookType';
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
    if (!this.options) {
      this.catalogService.getCatalogParam('tiposChequera', 'moneda', this.currency)
        .then((checkbookTypes: any) => {
          this.checkbookTypes = checkbookTypes; 
          if (this.checkbookType != null && this.checkbookType.id.codigo != null) {
            const checkbookTypeFind = this.checkbookTypes.find((item) => item.id.codigo === this.checkbookType.id.codigo);
            this.checkbookType = checkbookTypeFind;
            if (!this.checkbookType) {
              this.checkbookType = this.checkbookTypes[0];
            }
            this.changeCheckbookType.emit(this.checkbookType);
          }
        });
    } else {
      this.checkbookTypes = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: TipoChequera) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.checkbookTypes.slice(0, 20);
      }
      if (terms.term) {
        return this.checkbookTypes.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.checkbookTypes.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['checkbookTypeSelected'] !== undefined) {
      if (changes['checkbookTypeSelected'].currentValue !== undefined && changes['checkbookTypeSelected'].currentValue !== null) {
        if (this.checkbookTypes) {
          const checkbookType = this.checkbookTypes.find((item) => item.id.codigo === changes['checkbookTypeSelected'].currentValue);
          if (checkbookType) {
            this.checkbookType = checkbookType;
          }
        }
      }
    }

    if (changes['checkbookType'] !== undefined) {
      if (this.checkbookTypes) {
        const checkbookType = this.checkbookTypes.find((item) => item.id.codigo === changes['checkbookType'].currentValue.id.codigo);
        if (checkbookType) {
          this.checkbookType = checkbookType;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeCheckbookType.emit(newObj.item);
    } else {
      this.changeCheckbookType.emit(newObj);
    }
  }

}
