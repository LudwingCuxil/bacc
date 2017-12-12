import { Injectable } from "@angular/core";
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from "../../../environments/environment";

@Injectable()
export class OriginFundService{
  private originFundsUrl = environment.apiUrl + '/api/';

  constructor(private securityService: SecurityService){}

  getOriginFundsService(pager?: any): Promise<any>{
    return this.securityService.get(this.originFundsUrl + 'origenesFondo')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any>{
    return Promise.reject(error.message || error);
  }
}
