import { Injectable} from '@angular/core';
import "rxjs/add/operator/toPromise";

import {Headers, Http, RequestOptions} from '@angular/http'
import {SecurityService} from 'security-angular/src/app/security';
import {ProductTypeService} from 'backoffice-ace/src/app/product/shared/product-type.service';
import {environment} from '../../../../environments/environment';

@Injectable()
export class ProductTypeClientService extends ProductTypeService {

  private productType: string = environment.apiUrl + '/api/tipoProductos';

  constructor(private httpClient:Http, private securityServiceClient: SecurityService) {
    super(httpClient, securityServiceClient);
  }

  getProductType(): Promise<any> {
    return this.securityServiceClient.get(this.productType)
      .then(response => response.json())
  }

  getEndpoint() : string {
    return this.productType;
  }

  setEndpoint(url: string) : void{
    this.productType = url;
  }

}
