import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TipoInstitucion} from '../shared/client/tipo-institucion';
import {TypeInstitutionService} from './shared/type-institution.service';

import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';

@Component({
  selector: 'pl-type-institution-select',
  templateUrl: './type-institution.select.component.html',
  providers: [TypeInstitutionService],
  styleUrls: ['./type-institution.select.component.css']
})

export class TypeInstitutionSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: TipoInstitucion[];
  @Input() typeInstitutionSelected: number;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeTypeInstitution: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() typeInstitution = new TipoInstitucion();
  typeInstitutions: TipoInstitucion[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public typeInstitutionService: TypeInstitutionService) {
    this.changeTypeInstitution = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'typeInstitution';
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
      this.typeInstitutionService.getTypeInstitutionService()
        .then((typeInstitutions: any) => {
          this.typeInstitutions = typeInstitutions;
          if (this.typeInstitution != null && this.typeInstitution.codigo != null) {
            const typeInstitutionFind = this.typeInstitutions.find((item) => item.codigo === this.typeInstitution.codigo);
            this.typeInstitution = typeInstitutionFind;
          }
        });
    } else {
      this.typeInstitutions = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: TipoInstitucion) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.typeInstitutions.slice(0, 20);
      }
      if (terms.term) {
        return this.typeInstitutions.filter(v =>
        v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.typeInstitutions.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['typeInstitutionSelected'] !== undefined) {
      if (changes['typeInstitutionSelected'].currentValue !== undefined && changes['typeInstitutionSelected'].currentValue !== null) {
        if (this.typeInstitutions) {
          const typeInstitution = this.typeInstitutions.find((item) => item.codigo === changes['typeInstitutionSelected'].currentValue);
          if (typeInstitution) {
            this.typeInstitution = typeInstitution;
          }
          else{
            this.typeInstitution.codigo = changes['typeInstitutionSelected'].currentValue;
          }
        }
      }
    }

    if (changes['typeInstitution'] !== undefined) {
      if (this.typeInstitutions) {
        const typeInstitution = this.typeInstitutions.find((item) => item.codigo == changes['typeInstitution'].currentValue.codigo);
        if (typeInstitution) {
          this.typeInstitution = typeInstitution;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeTypeInstitution.emit(newObj.item);
    } else {
      this.changeTypeInstitution.emit(newObj);
    }
  }

}
