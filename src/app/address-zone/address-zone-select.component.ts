import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {AddressZoneService} from './shared/address-zone.service';
import {Zona} from '../shared/client/zona';


@Component({
  selector: 'pl-address-zone-select',
  templateUrl: './address-zone-select.component.html',
  styles: [''],
  providers: [AddressZoneService]
})

export class AddressZoneSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Zona[];
  @Input() addressZoneSelected: string;
  @Output() changeAddressZone: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() addressZone = new Zona();
  zones: Zona[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public addressZoneService: AddressZoneService) {
    this.changeAddressZone = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'addressZone';
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
      this.addressZoneService.getZones()
        .then((zones: any) => {
          this.zones = zones;
          if (this.addressZone != null && this.addressZone.codigo != null) {
            const addressZoneFind = this.zones.find((item) => item.codigo === this.addressZone.codigo);
            this.addressZone = addressZoneFind ? addressZoneFind : new Zona();
          }
        });
    } else {
      this.zones = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      if (control.validator === Validators.required) {
        control.setValidators([this.validateInput]);
      }
    }
  }

  formatter = (result: Zona) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.zones.slice(0, 20);
      }
      if (terms.term) {
        return this.zones.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.zones.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['addressZoneSelected'] !== undefined) {
      if (changes['addressZoneSelected'].currentValue !== undefined && changes['addressZoneSelected'].currentValue !== null) {
        if (this.zones) {
          const addressZone = this.zones.find((item) => item.codigo === changes['addressZoneSelected'].currentValue);
          if (addressZone) {
            this.addressZone = addressZone;
          }
        }
      }
    }

    if (changes['addressZone'] !== undefined) {
      if (this.zones) {
        const addressZone = this.zones.find((item) => item.codigo === changes['addressZone'].currentValue.codigo);
        if (addressZone) {
          this.addressZone = addressZone;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeAddressZone.emit(newObj.item);
    } else {
      this.changeAddressZone.emit(newObj);
    }
  }
}
