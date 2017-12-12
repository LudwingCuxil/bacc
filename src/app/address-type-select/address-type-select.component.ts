import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AddressTypeService} from './shared/address-type.service';
import {Subject} from 'rxjs/Subject';
import {FormControl, FormGroup} from '@angular/forms';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {TipoDireccion} from '../shared/client/tipo-direccion';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';

@Component({
  selector: 'pl-address-type-select',
  templateUrl: './address-type-select.component.html',
  styles: [''],
  providers: [AddressTypeService, PlParameterService]
})
export class AddressTypeSelectComponent implements OnInit, OnChanges {

  static DIR_PARAM_TYPE = 'PARAM_TIPDID';
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: TipoDireccion[];
  @Input() addressTypeSelected: number;
  @Output() changeAddressType: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() addressType = new TipoDireccion();
  addressTypes: TipoDireccion[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  constructor(private addressTypeService: AddressTypeService, private _parameterService: PlParameterService) {
    this.changeAddressType = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'addressType';
    }

    if (!this.options) {
      this._parameterService.getplParameter(undefined, AddressTypeSelectComponent.DIR_PARAM_TYPE).then((response) => {
        this.addressTypeService.getAddressTypes()
          .then((addressTypes: any) => {
            this.addressTypes = addressTypes;
            const address = this.addressTypes.find((item) => (this.addressTypeSelected ? this.addressTypeSelected : parseInt(response.valor, 10)) === item.codigo);
            if (address) {
              this.addressType = address;
            }
          });
      }).catch((e) => {
        this.addressTypeService.getAddressTypes()
          .then((addressTypes: any) => {
            this.addressTypes = addressTypes;
            if (this.addressType != null && this.addressType.codigo != null) {
              const addressTypeFind = this.addressTypes.find((item) => item.codigo === this.addressType.codigo);
              this.addressType = addressTypeFind;
            }
          });
      });
    } else {
      this.addressTypes = this.options;
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
    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: TipoDireccion) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.addressTypes.slice(0, 20);
      }
      if (terms.term) {
        return this.addressTypes.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.addressTypes.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['addressTypeSelected'] !== undefined) {
      if (changes['addressTypeSelected'].currentValue !== undefined && changes['addressTypeSelected'].currentValue !== null) {
        if (this.addressType && this.addressType.codigo === changes['addressTypeSelected'].currentValue) {
          return;
        }
        if (this.addressTypes) {
          const addressType = this.addressTypes.find((item) => item.codigo === changes['addressTypeSelected'].currentValue);
          if (addressType) {
            this.addressType = addressType;
          }
        }
      }
    }

    if (changes['addressType'] !== undefined) {
      if (this.addressTypes) {
        const addressType = this.addressTypes.find((item) => item.codigo === changes['addressType'].currentValue.id.codigo);
        if (addressType) {
          this.addressType = addressType;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeAddressType.emit(newObj.item);
    } else {
      this.changeAddressType.emit(newObj);
    }
  }
}
