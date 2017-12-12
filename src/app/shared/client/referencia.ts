/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {ReferenciaAccionista} from './referencia-accionista';
import {ReferenciaComercial} from './referencia-comercial';
import {ReferenciaComerciante} from './referencia-comerciante';
import {ReferenciaCredito} from './referencia-credito';
import {ReferenciaConyugue} from './referencia-conyugue';
import {ReferenciaCuenta} from './referencia-cuenta';
import {ReferenciaDependiente} from './referencia-dependiente';
import {ReferenciaLaboral} from './referencia-laboral';
import {ReferenciaLaboralConyugue} from './referencia-laboral-conyugue';
import {ReferenciaParentescoEmpleado} from './referencia-parentesco-empleado';
import {ReferenciaPersonalFamiliar} from './referencia-personal-familiar';
import {ReferenciaPropiedad} from './referencia-propiedad';
import {ReferenciaProveedor} from './referencia-proveedor';
import {ReferenciaSeguro} from './referencia-seguro';
import {ReferenciaTarjetaCredito} from './referencia-tarjeta-credito';
import {ReferenciaVehiculo} from './referencia-vehiculo';


export class Referencia {

  referenciasAccionistas: ReferenciaAccionista [] = [] = [];
  referenciasComerciales: ReferenciaComercial [] = [];
  referenciasComerciante: ReferenciaComerciante [] = [];
  referenciasConyugue: ReferenciaConyugue [] = [];
  referenciasCredito: ReferenciaCredito [] = [];
  referenciasCuentas: ReferenciaCuenta [] = [];
  referenciasDependientes: ReferenciaDependiente [] = [];
  referenciasLaborales: ReferenciaLaboral [] = [];
  referenciasLaboralesConyugue: ReferenciaLaboralConyugue [] = [];
  referenciasParentestoEmpleados: ReferenciaParentescoEmpleado [] = [];
  referenciasPersonalesFamiliares: ReferenciaPersonalFamiliar [] = [];
  referenciasPropiedades: ReferenciaPropiedad[] = [];
  referenciasProveedores: ReferenciaProveedor[] = [];
  referenciasSeguros: ReferenciaSeguro[] = [];
  referenciasTarjetasCredito: ReferenciaTarjetaCredito[] = [];
  referenciasVehiculos: ReferenciaVehiculo[] = [];

}

