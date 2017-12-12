  import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Nacionalidad} from '../shared/client/nacionalidad';
import {CountryService} from './shared/country.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';

@Component({
  selector: 'pl-country-select',
  templateUrl: './country-select.component.html',
  providers: [CountryService, PlParameterService],
  styleUrls: ['./country-select.component.css']
})

export class CountrySelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Nacionalidad[];
  @Input() countrySelected: string;
  @Input() showNationality = false;
  @Input() setDefaultValues = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeCountry: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() country = new Nacionalidad();
  countries: Nacionalidad[] = [];
  private PARAM_PAISDE = 'PARAM_PAISDE';
  resultOptionsSubject: Subject<any> = new Subject<any>();
  defaultValue: string;

  // @ViewChild('selectAuto');

  constructor(private countryService: CountryService, private _plService: PlParameterService) {
    this.changeCountry = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'country';
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
    if (!this.options) {
      this.countryService.getcountryService()
        .then((countries: any) => {
          this.countries = countries;
          if (this.setDefaultValues) {
            this._plService.getplParameter('', this.PARAM_PAISDE).then(value => {
              if (value && value.valor) {
                this.defaultValue = value.valor;
              }
              if (this.country !== undefined && this.country.codigo !== undefined && this.country.codigo !== '' ) {
                this.findAndSelect(this.country.codigo);
              } else {
                this.findAndSelect(value.valor);
              }
            });
          } else {
            if (this.country != null && this.country.codigo != null) {
              this.findAndSelect(this.country.codigo);
            }
          }
        });
    } else {
      this.countries = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  findAndSelect(value: string) {
    const countryFind = this.countries.find((item) => item.codigo === value);
    this.country = countryFind;
    this.changeCountry.emit(this.country);
  }

  formatter = (result: Nacionalidad) =>
    this.showNationality ? result.nacionalidad ? result.nacionalidad : '' : result.nombre ? result.nombre : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.countries.slice(0, 20);
      }
      if (terms.term) {
        return this.countries.filter(v => this.showNationality ? v.nacionalidad.toLowerCase().indexOf(terms.term.toLowerCase()) > -1
          : v.nombre.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.countries.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['countrySelected'] !== undefined) {
      if (changes['countrySelected'].currentValue !== undefined && changes['countrySelected'].currentValue !== null) {
        if (this.countries) {
          const country = this.countries.find((item) => item.codigo === changes['countrySelected'].currentValue);
          if (country) {
            this.country = country;
          }
        }
      }
    }

    if (changes['country'] !== undefined) {
      if (this.countries) {
        const country = this.countries.find((item) => item.codigo === changes['country'].currentValue.codigo);
        if (country) {
          this.country = country;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeCountry.emit(newObj.item);
    } else {
      this.changeCountry.emit(newObj);
    }
  }

  setDefaultValue() {
    if (this.defaultValue) {
      this.findAndSelect(this.defaultValue);
    }
  }

}
