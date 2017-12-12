import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Municipality} from './shared/municipality';
import {MunicipalityService} from './shared/municipality.service';
import {Subject} from 'rxjs/Subject';
import {FormControl, FormGroup} from '@angular/forms';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {Department} from '../department/shared/department';


@Component({
  selector: 'pl-municipality-select',
  templateUrl: './municipality-select.component.html',
  styles: [''],
  providers: [MunicipalityService]
})

export class MunicipalitySelectComponent implements OnInit, OnChanges {

  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Municipality[];
  @Input() municipalitySelected: string;
  @Input() department: Department;
  @Output() changeMunicipality: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() municipality = new Municipality();
  municipalities: Municipality[] = [];
  data: Municipality[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  constructor(public municipalityService: MunicipalityService) {
    this.changeMunicipality = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'municipality';
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
      this.municipalityService.getMunicipalities()
        .then((municipalitys: any) => {
          this.municipalities = municipalitys;
          if (this.municipality != null && this.municipality.id.codigo != null) {
            const municipalityFind = this.municipalities.find((item) => item.id.codigo === this.municipality.id.codigo && item.id.codigoRegion === this.municipality.id.codigoRegion
            && item.id.codigoDepartamento === this.municipality.id.codigoDepartamento);
            this.municipality = municipalityFind;
          }
          this.data = this.municipalities;
        });
    } else {
      this.municipalities = this.options;
      this.data = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Municipality) =>
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
    if (changes['municipalitySelected'] !== undefined) {
      if (changes['municipalitySelected'].currentValue !== undefined && changes['municipalitySelected'].currentValue !== null) {
        if (this.data) {
          const municipality = this.data.find((item) => item.id.codigo === changes['municipalitySelected'].currentValue.nivelGeografico33
          && item.id.codigoRegion === changes['municipalitySelected'].currentValue.nivelGeografico31
          && item.id.codigoDepartamento === changes['municipalitySelected'].currentValue.nivelGeografico32);
          if (municipality) {
            this.municipality = municipality;
          }
        }
      }
    }

    if (changes['municipality'] !== undefined && changes['municipality'].currentValue !== undefined) {
      if (this.data) {
        const municipality = this.data.find((item) => item.id.codigo === changes['municipality'].currentValue.id.codigo && item.id.codigoRegion === changes['municipality'].currentValue.id.codigoRegion
        && item.id.codigoDepartamento === changes['municipality'].currentValue.id.codigoDepartamento);
        if (municipality) {
          this.municipality = municipality;
        }
      }
    }

    if (changes['department'] !== undefined && changes['department'].currentValue !== undefined) {
      if (this.data) {
        this.data = this.municipalities.filter((item) => item.id.codigoDepartamento === changes['department'].currentValue.id.codigo
        && item.id.codigoRegion === changes['department'].currentValue.id.codigoRegion
        && item.id.codigoPais === changes['department'].currentValue.id.codigoPais);
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeMunicipality.emit(newObj.item);
    } else {
      this.changeMunicipality.emit(newObj);
    }
  }
}
