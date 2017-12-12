import {SecurityService} from 'security-angular/src/app/security';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {AccountsFlows} from '../account/accouns-flows.enum';
import {AccountDto} from '../account/account-dto';
import {Section} from '../section';
import {AccountSummary} from '../account/account-summary';
import {Beneficiario} from '../account/beneficiary';
import {BeneficiarioFinal} from '../account/final-beneficiary';

@Injectable()
export class MnemonicoServices {
  mnemonicoUrl = environment.apiUrl + '/api/';


  constructor(private securityService: SecurityService) {}

  getShowHuellafoto(tipoPersona: any, empresa: string): Promise<Date> {
    return this.securityService.get(`${this.mnemonicoUrl}parametrosHuellaFoto/${empresa}?tipoPersona=${tipoPersona}`)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }


}


