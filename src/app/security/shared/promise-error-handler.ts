import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
@Injectable()
export class PromiseErrorHandlerService {
  private unhandleMessage = 'Ha ocurrido un error inesperado';

  constructor(private notificationService: NotificationsService) { }

  public handleHTTPError(error: any): void {

    const statusCode = error && error.status;
    let body = '';

    if (statusCode === 400 ) {

      if (error._body !== '') {
        try {
          body = JSON.parse(error._body).message;
        } catch (e) {
          body = this.unhandleMessage;
        }
      }

    } else {
      body = this.unhandleMessage;
    }

    this.notificationService.error('Error', body);
  }
  getHTTPErrorHandler(): any {
    return (error) => this.handleHTTPError(error);
  }
}
