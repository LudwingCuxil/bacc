import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProductType} from './shared/product-type.model';
import {ProductTypeService} from './shared/product-type.service';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'pl-type-product-select',
  templateUrl: './type-product-select.component.html',
  styleUrls: ['./type-product-select.component.css'],
  providers: [ProductTypeService]
})
export class ProductTypeSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Output() changeProductType: EventEmitter<ProductType>;
  @Input() options: ProductType[];
  @Input() productTypeSelected: number;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Input() radioMode: boolean;
  @Input() selectMode: boolean;

  @Input() autocomplete = false;
  @Input() productType: ProductType;

  productTypes: ProductType[];

  constructor(private productTypeService: ProductTypeService) {
    this.changeProductType = new EventEmitter<ProductType>();
  }

  ngOnInit() {
    if (!this.options) {
      this.productTypeService.getProductTypes({number: 0, size: 1500})
        .then((productTypes: any) => {
          if (productTypes && productTypes.length) {
            this.productTypes = productTypes;
            if (this.productType && this.productType.codigo) {
              this.productType = this.productTypes.find(type => type.codigo === this.productType.codigo);
            } else {
              this.productType = productTypes[0];
            }
            this.changeProductType.emit(this.productType);
          }
        });
    } else {
      this.productTypes = this.options;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productType'] && changes['productType'].currentValue) {
      if (this.productTypes && this.productTypes.length) {
        const prod = this.productTypes.find(item => item.codigo === changes['productType'].currentValue.codigo);
        if (prod) {
          this.productType = changes['productType'].currentValue;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeProductType.emit(newObj.item);
      return;
    }
    this.changeProductType.emit(newObj);
  }
}
