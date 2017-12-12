import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {DireccionCliente} from '../../shared/account/client-direction';
import { PartialPersistService } from '../../shared/services/partial-persist.service';
import { AccountDto } from '../../shared/account/account-dto';
@Component({
  selector: 'pl-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})

export class AddressComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: DireccionCliente[];
  @Input() addressSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeAddress: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() address = new DireccionCliente();
  account: AccountDto;
  addresses: DireccionCliente[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(private partialPersistService: PartialPersistService) {
    this.changeAddress = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'address';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.direccion1 && input.value.direccion1.length > 2) {
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
      if (this.partialPersistService.data) {
        this.account = this.partialPersistService.data;
        if (this.account.clientInformation)
          this.addresses = this.account.clientInformation.direcciones;
        if (this.address.codigo === null || this.address.codigo === 0) {
          if (this.addresses)
            this.address = this.addresses[0];
            this.changeAddress.emit(this.address);
        }
      }
    } else {
      this.addresses = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: DireccionCliente) =>
    result.direccion1 ? result.direccion1 : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.addresses.slice(0, 20);
      }
      if (terms.term) {
        return this.addresses.filter(v => v.direccion1.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.addresses.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['addressSelected'] !== undefined) {
      if (changes['addressSelected'].currentValue !== undefined && changes['addressSelected'].currentValue !== null) {
        if (this.addresses) {
          const address = this.addresses.find((item) => item.codigo === changes['addressSelected'].currentValue);
          if (address) {
            this.address = address;
          }
        }
      }
    }

    if (changes['address'] !== undefined) {
      if (this.addresses) {
        const address = this.addresses.find((item) => item.codigo === changes['address'].currentValue.codigo);
        if (address) {
          this.address = address;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeAddress.emit(newObj.item);
    } else {
      this.changeAddress.emit(newObj);
    }
  }

}
