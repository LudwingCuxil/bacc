import {SecurityService} from 'security-angular/src/app/security';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AccountsFlows } from '../account/accouns-flows.enum';
import { AccountDto } from '../account/account-dto';
import { Section } from '../section';
import {AccountSummary} from '../account/account-summary';
import { Beneficiario } from '../account/beneficiary';
import { BeneficiarioFinal } from '../account/final-beneficiary';
@Injectable()
export class AccountsServices{
  accountsUrl = environment.apiUrl + '/api/cuentas';
  //http://172.16.13.8:8080/services/api/cuentas

  constructor(private securityService: SecurityService){}

  validationForm(business: string, section: any, account: AccountDto): Promise<any>{
    return this.securityService.post(this.accountsUrl+`/validarFormulario?empresa=${business}&seccion=${section}`, JSON.stringify(account))
      .then(response => response.json)
      .catch(this.handleError);
  }

  getOperationDate(business: string): Promise<Date>{
    return this.securityService.get(`${this.accountsUrl}/fechaOperacion?empresa=${business}`)
      .then(response => response.json())
      .catch(this.handleError);
  }
  

  
  validateBeneficiary(beneficiary: Beneficiario): Promise<any> {
    return this.securityService.post(`${this.accountsUrl}/beneficiarios/validate`, JSON.stringify(beneficiary))
      .then(response => response.json())
      .catch(this.handleError);
  }

  validateBeneficiaryFinal(beneficiary: BeneficiarioFinal): Promise<any> {
    return this.securityService.post(`${this.accountsUrl}/beneficiarios/validate`, JSON.stringify(beneficiary))
      .then(response => response.json())
      .catch(this.handleError);
  }

  saveAccount (account: any, business: string): Promise<any> {
    return this.securityService.post(this.accountsUrl+'?empresa='+business, JSON.stringify(account))
    .then(response => response.json())
    .catch(this.handleError);
  }

  getAccountsByClient(identificationType: string, identification: string, excluir: number[], status: string[], currency: string[]) : Promise<AccountSummary[]>{
    return this.securityService.get(this.accountsUrl+'?tipoDocumento='+identificationType+'&documento='+identification+'&excluir='+excluir+'&estados='+status+'&monedas='+currency)
      .then((response) => response.json() as AccountSummary[])
      .catch(this.handleError);
  }

  getAccountBySection(accountNumber: string, section: string): Promise<AccountDto> {
    return this.securityService.get(`${this.accountsUrl}/${accountNumber}/${section}`)
      .then(response => response.json() as AccountDto)
      .catch(this.handleError);
  }

  putAccountBySection(account: AccountDto, accountNumber: string, section: string): Promise<AccountDto> {
    const body = JSON.stringify(account);
    return this.securityService.put(`${this.accountsUrl}/${accountNumber}/${section}`, body)
      .then(response => response.json() as AccountDto)
      .catch(this.handleError);
  }

  getRate(account: any, business: string): Promise<any> {
    return this.securityService.post(this.accountsUrl+'/tasaInteres'+'?empresa='+business, JSON.stringify(account))
    .then(response => response.json())
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
