import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {FormControl, FormGroup} from '@angular/forms';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {CatalogService} from '../../shared/services/catalog.service';
import {ReferenceType} from './shared/reference-type';


@Component({
  selector: 'pl-reference-type-select',
  templateUrl: './type-select.component.html',
  styles: [''],
  providers: [CatalogService]
})

export class ReferenceTypeSelectComponent implements OnInit, OnChanges {

  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: ReferenceType[];
  @Input() typeSelected: number;
  @Output() changeType: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() type = new ReferenceType();
  references: ReferenceType[] = [];
  data: ReferenceType[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  constructor(public catalogService: CatalogService) {
    this.changeType = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'referenceType';
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
      this.catalogService.getCatalog('tiposReferencias')
        .then((types: any) => {
          this.references = types;
          if (this.type != null && this.type.codigo != null) {
            const municipalityFind = this.references.find((item) => item.codigo === this.type.codigo);
            this.type = municipalityFind;
          }
          this.data = this.references;
        });
    } else {
      this.references = this.options;
      this.data = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: ReferenceType) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.data.slice(0, 20);
      }
      if (terms.term) {
        return this.data.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.data.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['typeSelected'] !== undefined) {
      if (changes['typeSelected'].currentValue !== undefined && changes['typeSelected'].currentValue !== null) {
        if (this.data) {
          const type = this.data.find((item) => item.codigo === changes['typeSelected'].currentValue);
          if (type) {
            this.type = type;
          }
        }
      }
    }

    if (changes['type'] !== undefined) {
      if (this.data) {
        const type = this.data.find((item) => item.codigo === changes['type'].currentValue.codigo);
        if (type) {
          this.type = type;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeType.emit(newObj.item);
    } else {
      this.changeType.emit(newObj);
    }
  }
}
