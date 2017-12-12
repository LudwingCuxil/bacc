import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class ProductService {
  productUrl: string = environment.apiUrl + '/api/productos';

  constructor(private securityService: SecurityService) {}

  getProductMaster(currency?: string, productType?: number, pager?: any): Promise<any> {
    return this.securityService.get(this.productUrl + this.buildSuffix(currency, productType))
      .then(response => response.json())
      .catch(this.handleError);
  }

  getProductDetail(product: number, subProduct: number, pager?: any): Promise<any> {
    return this.securityService.get(`${this.productUrl}/${product}/${subProduct}`)
      .then(response => response.json())
      .catch(this.handleError);
  }
  
  getField(entity: string, campo: string, product: number, subProduct: number, pager?: any): Promise<any> {
    return this.securityService.get(`${environment.apiUrl+'/api/cuentas/'+entity}?campo=${campo}&producto=${product}&subProducto=${subProduct}`)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getProduct(pager: any): Promise<any> {
    return this.getProductMaster(null, null, pager);
  }

  getProductByCurrency(currency: string, pager?: any): Promise<any> {
    return this.getProductMaster(currency, null, pager);
  }

  getProductByProductType(productType: number, pager?: any): Promise<any> {
    return this.getProductMaster(null, productType, pager);
  }

  getDetailProduct(id: number): Promise<any> {
    return this.securityService.get(this.productUrl)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private buildSuffix(currency?: string, productType?: number): string {
    let suffix = (currency || productType ? '?' : '');
    suffix += (currency ? ('moneda=' + currency) : '');
    if (suffix.indexOf('=') >= 0) {
      suffix += '&';
    }
    suffix += (productType ? ('tipoProducto=' + productType) : '');
    return suffix;
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
