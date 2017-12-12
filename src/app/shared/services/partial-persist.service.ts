import {Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {WebForm} from '../webform';
import {NavigationService} from './navigation.service';
import {Section} from '../section';
import {WebFormName} from '../webform-name';

@Injectable()
export class PartialPersistService {

  private _data: any;
  private _extraData: any;
  private _partial: {
    id: number,
    version: number,
    username: string,
    webformName: string,
    createDate: any,
    lastUpdateDate: any,
    content: any
  };
  // private _account = new Account
  private _partialPersistURL: string = environment.apiUrl + '/api/webform/';

  constructor(private _securityService: SecurityService, private _navigationService: NavigationService) {
    this._partial = {
      id: 0,
      version: undefined,
      username: undefined,
      webformName: undefined,
      createDate: undefined,
      lastUpdateDate: undefined,
      content: undefined
    };
  }

  saveOrUpdate(name: string, prototype: any, param?: any): Promise<any> {
    const webform = new WebForm(prototype, {
      available: this._navigationService.availableSections,
      current: this._navigationService.currentSections,
    }, param);
    this.data = prototype;
    this.extraData = param;
    const webformText = JSON.stringify(webform);
    const body = JSON.stringify(this.instance(name, webformText));
    return this._securityService.post(this._partialPersistURL, body)
      .then((response) => response.json())
      .catch(this.handleError);
  }

  removeWebForm(name: string): Promise<any> {
    return this._securityService.delete(this._partialPersistURL + name)
      .then((response) => {
        this._navigationService.cleanUp();
      })
      .catch(this.handleError);
  }

  getForm(name: string): Promise<any> {
    return this._securityService.get(this._partialPersistURL + name)
      .then((response) => {
        this._partial = response.json();
        const webForm = JSON.parse(this._partial.content);
        this._navigationService.currentSections = webForm.navigation.current;
        this._navigationService.availableSections = webForm.navigation.available;
        if (name === WebFormName[WebFormName.WEBFORM_CUENTA]) {
          const clientSummary = this._securityService.getCookie('client_signature');
          if (clientSummary) {
            this._navigationService.selectLastSection({section: Section.signature, status: false});
          }
          const clientSummaryJoint = this._securityService.getCookie('client_mancomunado');
          if (clientSummaryJoint) {
            this._navigationService.selectLastSection({section: Section.jointAccount, status: false});
          }
          if (!clientSummary && !clientSummaryJoint) {
            this._navigationService.selectLastActiveSection();
          }
        } else {
          this._navigationService.selectLastActiveSection();
        }
        this.data = webForm.data;
        this.extraData = webForm.extraData;
        return webForm.data;
      }).catch(this.handleError);
  }

  checkPartial(name: string): Promise<any> {
    return this._securityService.get(this._partialPersistURL + name)
      .then((response) => {
        this._partial = response.json();
        return true;
      }).catch(this.handleError);
  }

  get data(): any {
    return this._data;
  }

  set data(value: any) {
    this._data = value;
  }

  get extraData(): any {
    return this._extraData;
  }

  set extraData(value: any) {
    this._extraData = value;
  }

  instance(name: string, body: any): any {
    return {
      id: this._partial.id,
      version: null,
      username: null,
      webformName: name,
      createDate: null,
      lastUpdateDate: null,
      content: body
    };
  }

  private handleError(error: any): Promise<any> {
    if (error.status === 409) {
      this._partial = {
        id: 0,
        content: undefined,
        webformName: undefined,
        version: undefined,
        username: undefined,
        createDate: undefined,
        lastUpdateDate: undefined
      };
    }
    return Promise.reject(error.message || error);
  }
}
