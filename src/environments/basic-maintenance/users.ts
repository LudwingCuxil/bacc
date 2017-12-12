import { SearchDataType } from '@byte/ng-components';
import { Validators } from '@angular/forms';

const mascaraDeCodigos = { mask: [/\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/], guide: false };


export const users = {
  name: 'Usuarios',
  resourcePath: '/api/usuario',
  table: {
    header: ['Nombre', 'Email', 'Habilitado', 'Bloqueado', 'Acciones'],
    values: ['nombreCompleto', 'email', 'habilitado', 'cuentaBloqueada'],
  },
  search: {
    placeholder: 'Buscar',
    dataTypes: [
      SearchDataType.string,
      SearchDataType.string,
      SearchDataType.string,
      SearchDataType.string,
      SearchDataType.string,
    ],
    fields: [
      'primerNombre',
      'segundoNombre',
      'primerApellido',
      'segundoApellido',
      'email',
    ],
  },
  schema: [
    {
      key: 'id',
      controlType: 'hidden',
    },
    {
      key: 'estado',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'passwordExpirado',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'sesionesMultiples',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'cuentaExpirada',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'credencialesExpiradas',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'caducaContrasenia',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'passwordReset',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'intentosFallidos',
      controlType: 'hidden',
      value: false,
    },
    {
      key: 'password',
      controlType: 'hidden',
      value: '',
    },
    [
      {
        key: 'username',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Usuario',
        editable: false,
        isMarked: true,
        validators: [Validators.required],
      },
      {
        key: 'email',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Email',
        isMarked: true,
        validators: [Validators.required, Validators.email]
      }
    ],
    [
      {
        key: 'codigoAntiguedad',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Codigo antigüedad',
        isMarked: true,
        validators: [Validators.required, Validators.pattern(/\d+/)],
        mask: mascaraDeCodigos
      },
      {
        key: 'codigoCorporativo',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Codigo Corporativo',
        isMarked: true,
        validators: [Validators.required, Validators.pattern(/\d+/)],
        mask: mascaraDeCodigos
      }
    ],
    [
      {
        key: 'primerNombre',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Primer Nombre',
        isMarked: true,
        validators: [Validators.required],
      },
      {
        key: 'segundoNombre',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Segundo Nombre',
      }
    ],
    [
      {
        key: 'primerApellido',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Primer Apellido',
        isMarked: true,
        validators: [Validators.required],
      },
      {
        key: 'segundoApellido',
        controlType: 'textbox',
        type: 'text',
        placeholder: 'Segundo Apellido',
      }
    ],
    [
      {
        key: 'habilitado',
        controlType: 'dropdown',
        placeholder: 'Habilitado',
        isMarked: true,
        validators: [Validators.required],
        options: [
          { key: 'Si', value: true },
          { key: 'No', value: false },
        ],
      },
      {
        key: 'cuentaBloqueada',
        controlType: 'dropdown',
        placeholder: 'Cuenta Bloqueada',
        isMarked: true,
        validators: [Validators.required],
        options: [
          { key: 'Si', value: true },
          { key: 'No', value: false },
        ],
      }
    ],
    {
      key: 'defaultProfileName',
      controlType: 'dropdown',
      placeholder: 'Perfil',
      isMarked: true,
      validators: [Validators.required],
      options: [],
    },
  ]
};
