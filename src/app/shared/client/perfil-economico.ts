/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {ActividadEconomica} from './actividad-economica';
import {ClaseCliente} from './clase-cliente';
import {TipoCliente} from './tipo-cliente';
import {SectorEconomico} from './sector-economico';
import {EconomicGroup} from '../../group/shared/economic-group';

export class PerfilEconomico {

  public actividadEconomica = new ActividadEconomica();
  public afectoISR = true;
  public claseCliente = new ClaseCliente();
  public codigoEmpleado = 0;
  public generadorDivisas: boolean;
  public parentescoEmpleadoBanco = false;
  public relacionEconomica: number;
  public perteneceGrupoEconomico = false;
  public gruposEconomicos: EconomicGroup[] = [];
  public rtn = '';
  public sectorEconomico = new SectorEconomico();
  public tin = '';
  public tipoCliente = new TipoCliente();
  public tipoInstitucion: number;
  public institucion: number;

}
