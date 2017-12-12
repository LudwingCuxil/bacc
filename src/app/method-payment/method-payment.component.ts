import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MethodPaymentService } from "./shared/method-payment.service";
import { MethodPayment } from './shared/method-payment.model';
import { FormGroup } from '@angular/forms';
import { ProductService } from '../product-select/shared/product.service';
import { PartialPersistService } from '../shared/services/partial-persist.service';

@Component({
  selector: 'pl-method-payment',
  templateUrl: './method-payment.component.html',
  styleUrls: ['./method-payment.component.css'],
  providers: [ProductService]
})
export class MethodPaymentComponent implements OnInit, OnChanges {
  @Output() methodUpdated = new EventEmitter<MethodPayment>();
  @Input() methodPaymentSelected: any;
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: MethodPayment[];
  @Input() disable = false;
  @Input() modeView = false;
  @Input() modeDelete = false;
  @Input() autocomplete = false;
  @Input() radioMode = false;
  @Input() selectMode = false;
  @Input() methodPayment = new MethodPayment();

  public mask = '';
  public mascara = [];
  public methodsPayment: MethodPayment[] = [];

  constructor(private productService: ProductService) {
  }

  ngOnInit() {
    if (!this.options) {
      /*if (this.partialPersistService.data && this.partialPersistService.data.producto && this.partialPersistService.data.producto.id
        && this.partialPersistService.data.producto.id.producto && this.partialPersistService.data.producto.id.subProducto) {*/
      if (this.methodPaymentSelected && this.methodPaymentSelected.producto && this.methodPaymentSelected.producto.id && this.methodPaymentSelected.producto.id.producto && this.methodPaymentSelected.producto.id.subProducto) {
        this.fetchMethodsPayment(this.methodPaymentSelected.producto.id.producto, this.methodPaymentSelected.producto.id.subProducto);
      }
    } else {
      this.methodsPayment = this.options;
      this.methodPayment = this.methodsPayment[0];
      this.selectRadio(this.methodPayment.codigo);
      this.methodUpdated.emit(this.methodPayment);
    }
  }

  async fetchMethodsPayment(product: number, subProduct: number) {
    let producto = await this.productService.getProductDetail(product, subProduct, {number: 0, size: 1500});
    if(producto) {
      if (producto.formasPagoInteres && producto.formasPagoInteres.length) {
        for (const prod of producto.formasPagoInteres) {
          const {tipo} = prod.id;
          if (tipo) {
            this.methodsPayment.push(new MethodPayment(tipo.codigo, tipo.descripcion, tipo.accion, tipo.soloVariable));
          }
        }
        if (this.methodsPayment && this.methodsPayment.length) {
          if (this.methodPayment && this.methodPayment.codigo) {
            const found = this.methodsPayment.find(item => item.codigo === this.methodPayment.codigo);
            this.methodPayment = found ? found : this.methodsPayment[0];
          } else {
            this.methodPayment = this.methodsPayment[0];
          }
          this.selectRadio(this.methodPayment.codigo);
          this.methodUpdated.emit(this.methodPayment);
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['methodPaymentSelected'] && changes['methodPaymentSelected'].currentValue) {
      const selected = changes['methodPaymentSelected'].currentValue;
      if (selected.product && selected.subProduct) {
        this.fetchMethodsPayment(selected.product, selected.subProduct)
      }
    }

    if (changes['methodPayment'] && changes['methodPayment'].currentValue) {
      if (this.methodsPayment && this.methodsPayment.length) {
        const method = this.methodsPayment.find(item => item.codigo === changes['methodPayment'].currentValue.codigo);
        if (method) {
          this.methodPayment = method;
          this.selectRadio(this.methodPayment.codigo);
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (newObj) {
      if (this.autocomplete) {
        this.methodUpdated.emit(newObj.item);
      } else {
        this.selectRadio(newObj.codigo);
        this.methodUpdated.emit(newObj);
      }
    }
  }

  selectRadio(codigo: number) {
    if (this.methodsPayment && this.methodsPayment.length) {
      this.methodsPayment.forEach(item => {
        item.selected = item.codigo === codigo;
      });
    }
  }

}
