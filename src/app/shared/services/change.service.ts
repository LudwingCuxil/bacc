import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {ClienteDto} from '../client/cliente-dto';
import {AccountDto} from '../account/account-dto';

@Injectable()
export class ChangeService {

  private changeURL = environment.apiUrl + '/api/clientes/';  // URL to web api
  private accountURL = environment.apiUrl + '/api/cuentas/';


  constructor(private securityService: SecurityService) {
  }

  getSection(identification: string, section?: string): Promise<ClienteDto> {
    return this.securityService.get(this.changeURL+identification+'/cambio/' + section)
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }
  
  putSection(client : ClienteDto, identification: string, section: string) : Promise<ClienteDto>{
    let body = JSON.stringify(client);
    return this.securityService.put(this.changeURL+identification+'/'+section, body)
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }
  
  getSectionAccount(accountNumber: string, section?: string): Promise<AccountDto> {
    return this.securityService.get(this.accountURL+accountNumber+'/'+section)
      .then((response) => response.json() as AccountDto)
      .catch(this.handleError);
  }
  
  getSpecialProduct(): Promise<any> {
    let body = this.securityService.getCookie('accountId');
    return this.securityService.post(this.accountURL+'productoEspecial', body)
    .then(response => response.json())
    .catch(this.handleError);
  }
  
  putSectionAccount(account : AccountDto, accountNumber: string, section: string) : Promise<AccountDto>{
    let body = JSON.stringify(account);
    return this.securityService.put(this.accountURL+accountNumber+'/'+section, body)
      .then((response) => response.json() as AccountDto)
      .catch(this.handleError);
  }
  
  finalBeneficiaries(accountNumber: string) : Promise<boolean> {
    return this.securityService.post(this.accountURL+accountNumber+'/clienteEsBeneficiarioFinal')
    .then((response) => response.json() as boolean)
    .catch(this.handleError);
  }
  
  changeFingerPhoto(identificationType: string, identification: string, tipo: string): Promise<any> {
    return this.securityService.post(this.changeURL+'cambioHuellaFoto?identificacion='+identification+'&tipoIdentificacion='+identificationType+'&tipo='+tipo)
    .then(response => response.json())
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
