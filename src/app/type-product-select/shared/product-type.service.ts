import {Injectable} from '@angular/core';
import { SecurityService } from 'security-angular/src/app/security/shared/security.service';
import { ProductType } from './product-type.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class ProductTypeService {
  productTypeURL = environment.apiUrl + '/api/tipoProductos';

  constructor(private securityService: SecurityService) {}

  getProductTypes(pager?: any): Promise<ProductType> {
    return this.securityService.get(this.productTypeURL)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getDetailProductType(id: number): Promise<any> {
    return this.securityService.get(this.productTypeURL + id)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
