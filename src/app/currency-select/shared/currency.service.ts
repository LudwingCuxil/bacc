import {Injectable} from "@angular/core";
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from "../../../environments/environment";
import { Currency } from './currency.model';

@Injectable()
export class CurrencyService{
  monedaUrl: string = environment.apiUrl + '/api/monedas';

  constructor(private securityService: SecurityService){}

  getCurrencies(pager?:any): Promise<any> {
    return this.securityService.get(this.monedaUrl)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getDetailCurrency(id: number) : Promise<any> {
    return this.securityService.get(this.monedaUrl+'/'+id)
      .then(response => response.json())
      .catch(this.handleError);
  }

  async getCurrencyDefault(): Promise<Currency>{
    const response = await this.securityService.get(this.monedaUrl+"/default");
    return response.json() as Currency;
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
