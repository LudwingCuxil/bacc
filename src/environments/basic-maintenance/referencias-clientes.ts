import { SearchDataType } from '@byte/ng-components';
import { Validators } from '@angular/forms';

export const referenciasClientes = {
    name: 'Referencias clientes',
    resourcePath: `/api/referenciasCliente`,
    table: {
       header: ['Id', 'Tipo de referencia', 'Descripción', 'Acciones'],
       values: ['id', 'tipoReferencia', 'description']
    },
    search: {
        placeholder: 'Buscar',
        dataTypes: [
          SearchDataType.string,
          SearchDataType.string,
        ],
        fields: [
          'tipoReferencia',
          'description'
        ]
    },
    schema: [
      {
          key: 'id',
          controlType: 'hidden'
      },
      {
        key: 'version',
        controlType: 'hidden',
        value: '0'
      },
      {
          key: 'tipoReferencia',
          controlType: 'textbox',
          type: 'text',
          placeholder: 'Tipo de referencia',
          editable: false,
          isMarked: true,
          validators: [Validators.required]
      },
      {
          key: 'description',
          controlType: 'textbox',
          type: 'text',
          placeholder: 'Descripción',
          isMarked: true,
      }
    ]
};
