import { SecurityService } from 'security-angular/src/app/security';
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class PromotionsService{
  private promotionsURL = environment.apiUrl + '/api/';

  constructor(private securityService: SecurityService){}

  getPromotionsService(pager?: any): Promise<any>{
    return this.securityService.get(this.promotionsURL + 'promociones')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any>{
    return Promise.reject(error.message || error);
  }
}
