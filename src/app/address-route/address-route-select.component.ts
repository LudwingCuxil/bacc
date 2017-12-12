import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AddressRoute} from './shared/address-route';
import {Subject} from 'rxjs/Subject';
import {AddressRouteService} from './shared/address-route.service';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {Ruta} from '../shared/client/ruta';


@Component({
  selector: 'pl-address-route-select',
  templateUrl: './address-route-select.component.html',
  styles: [''],
  providers: [AddressRouteService]
})

export class AddressRouteSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Ruta[];
  @Input() addressRouteSelected: string;
  @Output() changeAddressRoute: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() addressRoute = new Ruta();
  routes: Ruta[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public addressRouteService: AddressRouteService) {
    this.changeAddressRoute = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'addressRoute';
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
      this.addressRouteService.getRoutes()
        .then((routes: any) => {
          this.routes = routes;
          if (this.addressRoute != null && this.addressRoute.codigo != null) {
            const addressRouteFind = this.routes.find((item) => item.codigo === this.addressRoute.codigo);
            this.addressRoute = addressRouteFind ? addressRouteFind : new Ruta();
          }
        });
    } else {
      this.routes = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      if (control.validator === Validators.required) {
        control.setValidators([this.validateInput]);
      }
    }
  }

  formatter = (result: AddressRoute) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.routes.slice(0, 20);
      }
      if (terms.term) {
        return this.routes.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.routes.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['addressRouteSelected'] !== undefined) {
      if (changes['addressRouteSelected'].currentValue !== undefined && changes['addressRouteSelected'].currentValue !== null) {
        if (this.routes) {
          const addressRoute = this.routes.find((item) => item.codigo === changes['addressRouteSelected'].currentValue);
          if (addressRoute) {
            this.addressRoute = addressRoute;
          }
        }
      }
    }

    if (changes['addressRoute'] !== undefined) {
      if (this.routes) {
        const addressRoute = this.routes.find((item) => item.codigo === changes['addressRoute'].currentValue.codigo);
        if (addressRoute) {
          this.addressRoute = addressRoute;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeAddressRoute.emit(newObj.item);
    } else {
      this.changeAddressRoute.emit(newObj);
    }
  }
}
