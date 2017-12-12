import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchDataType } from '@byte/ng-components';
import { Validators } from '@angular/forms';
import { ReferenciasCliente } from '../shared/services/referencias-cliente';
import { NotificationsService } from 'angular2-notifications';
import { PromiseErrorHandlerService } from '../../security/shared/promise-error-handler';
import { ReferenciasClienteDetalleService } from '../shared/services/referencias-cliente-detalle.service';
import { Ng2SmartTableModule, LocalDataSource} from 'ng2-smart-table';

declare var $: any;

@Component({
  providers: [PromiseErrorHandlerService, ReferenciasClienteDetalleService],
  selector: 'pl-referencias-cliente',
  templateUrl: './referencias-cliente.component.html',
  styleUrls: ['./referencias-cliente.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class ReferenciasClienteComponent implements OnInit{
  public referenciasCliente: ReferenciasCliente;
  public settings = environment.basicMaintenance.referenciasClientes;
  public resourcePath = `${environment.apiUrl}${this.settings.resourcePath}`;
  public referenciasClienteDetalles: any[];
  public source: LocalDataSource;

  settingsHeader = {
    actions: {
      columnTitle: 'Acciones',
    },
    noDataMessage: 'No se han personalizado las cuotas.',
    delete: {
      confirmDelete: true,
      deleteButtonContent: '<i class="material-icons">delete</i>',
    },
    add: {
      confirmCreate: true,
      addButtonContent: '<i class="material-icons">add_box</i>',
      createButtonContent: '<i class="material-icons">check</i>',
      cancelButtonContent: '<i class="material-icons">clear</i>',
    },
    edit: {
      confirmSave: true,
      editButtonContent: '<i class="material-icons">mode_edit</i>',
      saveButtonContent: '<i class="material-icons">check</i>',
      cancelButtonContent: '<i class="material-icons">clear</i>',
    },
    columns: {
      uso: {
        title: 'Uso',
        type: 'html',
        filter: false,
        editor: {
          type: 'list',
          config: {
            list: [
              { value: 'J', title: 'Juridica'},
              { value: 'N', title: 'Natural'},
            ],
          }
        }
      },
      orden: {
        title: 'Orden',
        filter: false
      },
      minimo: {
        title: 'Minimo',
        filter: false
      },
      maximo: {
        title: 'Maximo',
        filter: false
      }
    }
  };

  constructor(
    private notificationService: NotificationsService,
    private promiseErrorHandlerService: PromiseErrorHandlerService,
    private referenciasClienteDetalleService: ReferenciasClienteDetalleService,
  ) { }

  onNotify(event) {
    switch (event.eventName) {
        case 'create':
        case 'update':
        case 'delete':
          this.notificationService.success('', 'Operacion completada exitosamente');
          break;
        case 'error':
          this.promiseErrorHandlerService.handleHTTPError(event.data && event.data.error);
          break;
    }
  }

  ngOnInit() {
    this.source = new LocalDataSource([]);
  }

  getRefenciasClienteDetalle(){
    this.referenciasClienteDetalleService
      .getRefenciasClienteDetalle(this.referenciasCliente.id)
      .then((referenciasClienteDetalles) => {
        this.source.load(referenciasClienteDetalles);
        $('#associateReferenciasClienteDetalleModal').modal('show');
      });
  }

  setRefenciasCliente(referenciasCliente: ReferenciasCliente) {
    this.referenciasCliente = JSON.parse(JSON.stringify(referenciasCliente));
    this.getRefenciasClienteDetalle();
  }

  reset(): void {
    this.referenciasCliente = undefined;
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'id', search: query },
      { field: 'version', search: query },
      { field: 'uso', search: query },
      { field: 'orden', search: query }
    ], false);
  }

  onDeleteConfirm(event) {
   if (window.confirm('Está seguro de elminar el registro?')) {
    const value = event.data.id;

    console.log('newData ', event);

    this.referenciasClienteDetalleService.deleteRefenciasClienteDetalle(value)
      .then(() => {
        this.notificationService.success('', 'Operacion completada exitosamente');

        event.confirm.resolve();
      })
      .catch((error) => {
        this.promiseErrorHandlerService.handleHTTPError(error);

        event.confirm.reject();
      });
   } else {
     event.confirm.reject();
   }
  }

  onSaveConfirm(event) {
    if (window.confirm('Está seguro de guardar los cambios?')) {
      const value = {
        'id': event.newData.id,
        'version': 0,
        'referencia': {
          'id': this.referenciasCliente.id,
          'version': this.referenciasCliente.version
        },
        'uso': event.newData.uso,
        'orden': event.newData.orden,
        'minimo': event.newData.minimo,
        'maximo': event.newData.maximo
      };

      this.referenciasClienteDetalleService.updateRefenciasClientesDetalle(value)
        .then(() => {
          this.notificationService.success('', 'Operacion completada exitosamente');

          event.confirm.resolve();
        })
        .catch((error) => {
          this.promiseErrorHandlerService.handleHTTPError(error);

          event.confirm.reject();
        });
    } else {
      event.confirm.reject();
    }
  }

  onCreateConfirm(event) {
    if (window.confirm('Está seguro de agregar el registro?')) {

      const value = {
        'version': 0,
        'referencia': {
          'id': this.referenciasCliente.id,
          'version': this.referenciasCliente.version
        },
        'uso': event.newData.uso,
        'orden': event.newData.orden,
        'minimo': event.newData.minimo,
        'maximo': event.newData.maximo
      };

      this.referenciasClienteDetalleService.addReferenciasClienteDetalle(value)
        .then(() => {
          this.notificationService.success('', 'Operacion completada exitosamente');

          event.confirm.resolve();
        })
        .catch((error) => {
          this.promiseErrorHandlerService.handleHTTPError(error);

          event.confirm.reject();
        });

    } else {
      event.confirm.reject();
    }
  }
}
