import { SearchDataType } from '@byte/ng-components';
import { Validators } from '@angular/forms';


export const profiles = {
  name: 'Perfiles',
  resourcePath: '/api/profiles',
  table: {
    header: ['Nombre', 'Descripcion', 'Activo', 'Acciones'],
    values: ['nombre', 'descripcion', 'activo'],
  },
  search: {
    placeholder: 'Buscar',
    dataTypes: [
      SearchDataType.string,
      SearchDataType.string,
    ],
    fields: [
      'nombre',
      'descripcion',
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
      key: 'activo',
      controlType: 'dropdown',
      placeholder: 'Activo',
      isMarked: true,
      validators: [Validators.required],
      options: [
        { key: 'Si', value: true },
        { key: 'No', value: false },
      ],
    },
  ]
};
