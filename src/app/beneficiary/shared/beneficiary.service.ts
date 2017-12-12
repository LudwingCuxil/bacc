import { Injectable } from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import { environment } from '../../../environments/environment';

@Injectable()
export class BeneficiaryService {
  beneficiaryUrl = environment.apiUrl + '/api/beneficiarios/';

  constructor(private securityService: SecurityService) {}

  validateBeneficiary(): Promise<any>{
    return this.securityService.get(`${this.beneficiaryUrl}/validate`)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
