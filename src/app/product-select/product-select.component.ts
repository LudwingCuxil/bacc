import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProductService} from './shared/product.service';
import {FormControl, FormGroup} from '@angular/forms';
import {isObject} from 'util';
import {Product} from '../shared/account/product';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'pl-product-select',
  templateUrl: './product-select.component.html',
  styleUrls: ['./product-select.component.css'],
  providers: [ProductService]
})
export class ProductSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Product[];
  @Input() productSelected: any;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeProduct: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() product = new Product();
  products: Product[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(private productService: ProductService) {
    this.changeProduct = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'product';
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

  formatter = (result: Product) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.products.slice(0, 20);
      }
      if (terms.term) {
        return this.products.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.products.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productSelected'] !== undefined) {
      if (changes['productSelected'].currentValue !== undefined && changes['productSelected'].currentValue.currency.codigo && changes['productSelected'].currentValue.productType.codigo) {
        this.productService.getProductMaster(changes['productSelected'].currentValue.currency.codigo, changes['productSelected'].currentValue.productType.codigo).then(results => {
          this.products = results;
          if (this.products) {
            if (this.product && this.product.tipoProducto === changes['productSelected'].currentValue.productType.codigo
              && this.product.moneda === changes['productSelected'].currentValue.currency.codigo) {
              this.product = results.find(item => item.id.producto === this.product.id.producto && item.id.subProducto === this.product.id.subProducto);
              return;
            }
            this.product = results[0];
          }
        });
      }
    }

    if (changes['product'] !== undefined && changes['product'].currentValue !== undefined && changes['product'].currentValue.id !== undefined) {
      if (this.products) {
        const product = this.products.find((item) => item.id.producto === changes['product'].currentValue.id.producto && item.id.subProducto === changes['product'].currentValue.id.subProducto);
        if (product) {
          this.product = product;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeProduct.emit(newObj.item);
    } else {
      this.changeProduct.emit(newObj);
    }
  }
}
