import { SearchDataType } from '@byte/ng-components';
import { Validators } from '@angular/forms';


export const roles = {
  name: 'Roles',
  resourcePath: '/api/roles',
  table: {
    header: ['Nombre', 'Descripcion', 'Tipo', 'Acciones'],
    values: ['nombre', 'descripcion', 'tipo'],
  },
  search: {
    placeholder: 'Buscar',
    dataTypes: [
      SearchDataType.string,
      SearchDataType.string,
      SearchDataType.string,
    ],
    fields: [
      'nombre',
      'descripcion',
      'tipo',
    ],
  },
  schema: [
    {
      key: 'id',
      controlType: 'hidden',
    },
    {
      key: 'nombre',
      controlType: 'textbox',
      type: 'text',
      placeholder: 'Nombre',
      editable: false,
      isMarked: true,
      validators: [Validators.required],
    },
    {
      key: 'descripcion',
      controlType: 'textbox',
      type: 'text',
      placeholder: 'Descripcion',
      isMarked: true,
      validators: [Validators.required],
    },
    {
      key: 'tipo',
      controlType: 'dropdown',
      placeholder: 'Tipo',
      isMarked: true,
      validators: [Validators.required],
      options: [
        { key: 'FUN', value: 'FUN' },
        { key: 'MOD', value: 'MOD' },
      ],
    },
  ]
};
