 package com.bytesw.platform.bs.controller;

import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.service.CatalogoService;
import com.bytesw.platform.bs.service.plataforma.ReferenciaClienteDetalleService;
import com.bytesw.platform.eis.bo.clientes.ActividadEconomica;
import com.bytesw.platform.eis.bo.clientes.Agencia;
import com.bytesw.platform.eis.bo.clientes.Barrio;
import com.bytesw.platform.eis.bo.clientes.ClaseCliente;
import com.bytesw.platform.eis.bo.clientes.Departamento;
import com.bytesw.platform.eis.bo.clientes.DocumentoRequerido;
import com.bytesw.platform.eis.bo.clientes.EjecutivoNegocio;
import com.bytesw.platform.eis.bo.clientes.Empleado;
import com.bytesw.platform.eis.bo.clientes.GrupoEconomico;
import com.bytesw.platform.eis.bo.clientes.Institucion;
import com.bytesw.platform.eis.bo.clientes.Moneda;
import com.bytesw.platform.eis.bo.clientes.Municipio;
import com.bytesw.platform.eis.bo.clientes.NivelGeografico;
import com.bytesw.platform.eis.bo.clientes.NivelRiesgo;
import com.bytesw.platform.eis.bo.clientes.NivelVentas;
import com.bytesw.platform.eis.bo.clientes.Pais;
import com.bytesw.platform.eis.bo.clientes.Profesion;
import com.bytesw.platform.eis.bo.clientes.RangoSueldos;
import com.bytesw.platform.eis.bo.clientes.Region;
import com.bytesw.platform.eis.bo.clientes.Ruta;
import com.bytesw.platform.eis.bo.clientes.SectorEconomico;
import com.bytesw.platform.eis.bo.clientes.SupervisorOperacion;
import com.bytesw.platform.eis.bo.clientes.TipoCliente;
import com.bytesw.platform.eis.bo.clientes.TipoDireccion;
import com.bytesw.platform.eis.bo.clientes.TipoDocumento;
import com.bytesw.platform.eis.bo.clientes.TipoInstitucion;
import com.bytesw.platform.eis.bo.clientes.TipoReferencia;
import com.bytesw.platform.eis.bo.clientes.TipoSociedad;
import com.bytesw.platform.eis.bo.clientes.Vinculacion;
import com.bytesw.platform.eis.bo.clientes.Zona;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.depositos.Frecuencia;
import com.bytesw.platform.eis.bo.depositos.OrigenFondo;
import com.bytesw.platform.eis.bo.depositos.Parentesco;
import com.bytesw.platform.eis.bo.depositos.ProductoResumen;
import com.bytesw.platform.eis.bo.depositos.Promocion;
import com.bytesw.platform.eis.bo.depositos.TipoChequera;
import com.bytesw.platform.eis.bo.depositos.TipoFormaPagoInteres;
import com.bytesw.platform.eis.bo.depositos.TipoProducto;
import com.bytesw.platform.eis.bo.depositos.UsoCuenta;
import com.bytesw.platform.eis.bo.plataforma.ReferenciaClienteDetalle;
import com.bytesw.platform.eis.dto.depositos.ProductoDTO;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Catalogo")
public class CatalogoController {

	protected Logger logger = Logger.getLogger(getClass().getName());
	
	private CatalogoService catalogoService;
	private ReferenciaClienteDetalleService referenciaClienteDetalleService;
	
	@Autowired
	public CatalogoController(CatalogoService catalogoService, ReferenciaClienteDetalleService referenciaClienteDetalleService) {
		this.catalogoService = catalogoService;
		this.referenciaClienteDetalleService = referenciaClienteDetalleService;
	}

	/** CL **/
	
	@RequestMapping(value = "/tipoDocumentos")
	@ApiOperation(value = "Retorna listado de tipos de documento", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoDocumento>> findTipoDocumentos(@RequestParam(value = "tipoPersona", required = false, defaultValue = "A") String tipoPersona){
		return new ResponseEntity<Iterable<TipoDocumento>>(catalogoService.findTipoDocumentosByTipoPersona(tipoPersona), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/monedas/default")
	@ApiOperation(value = "Retorna moneda por defecto", httpMethod = "GET")
	public ResponseEntity<Moneda> findMonedaDefault(){
		Moneda response = catalogoService.findMonedaDefault();
		if (null == response) {
			throw new ResourceNotFoundException();
		}
		return new ResponseEntity<Moneda>(response, HttpStatus.OK);
	}
	
	@RequestMapping(value = "/monedas")
	@ApiOperation(value = "Retorna listado de monedas", httpMethod = "GET")
	public ResponseEntity<Iterable<Moneda>> findMonedas() {
		return new ResponseEntity<Iterable<Moneda>>(catalogoService.findMonedasExistenEnProductos(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/sectoresEconomicos")
	@ApiOperation(value = "Retorna listado de sectores económicos", httpMethod = "GET")
	public ResponseEntity<Iterable<SectorEconomico>> findSectoresEconomicos(){
		return new ResponseEntity<Iterable<SectorEconomico>>(catalogoService.findSectoresEconomicos(null), HttpStatus.OK);
	}

	@RequestMapping(value = "/actividadesEconomicas")
	@ApiOperation(value = "Retorna listado de las actividades económicas", httpMethod = "GET")
	public ResponseEntity<Iterable<ActividadEconomica>> findActividadEconomica(){
		return new ResponseEntity<Iterable<ActividadEconomica>>(catalogoService.findActividadesEconomicas(null), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/profesiones")
	@ApiOperation(value = "Retorna listado de las profesiones", httpMethod = "GET")
	public ResponseEntity<Iterable<Profesion>> findProfesiones() {
		return new ResponseEntity<Iterable<Profesion>>(catalogoService.findProfesiones(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/ejecutivosNegocio")
	@ApiOperation(value = "Retorna listado de ejecutivos de negocios", httpMethod = "GET")
	public ResponseEntity<Iterable<EjecutivoNegocio>> findEjecutivoNegocio(
		@RequestParam(value = "empresa") String empresa,
		@RequestParam(value = "excludeClientes", required = false, defaultValue = "false") boolean excludeClientes) {
		Iterable<EjecutivoNegocio> response;
		if (excludeClientes) {
			response = catalogoService.findEjecutivosNoSonClientes(empresa, null);
		} else {
			response = catalogoService.findEjecutivosNegocio(empresa, null);
		}
		return new ResponseEntity<Iterable<EjecutivoNegocio>>(response, HttpStatus.OK);
	}
	
	@RequestMapping(value = "/empleadosNoClientes")
	@ApiOperation(value = "Retorna listado de empleados que no son clientes", httpMethod = "GET")
	public ResponseEntity<Iterable<Empleado>> findEmpleadosNoClientes(@RequestParam(value = "empresa") String empresa) {
		return new ResponseEntity<Iterable<Empleado>>(catalogoService.findEmpleadosNoClientes(empresa), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/empleados")
	@ApiOperation(value = "Retorna listado de empleados por empresa", httpMethod = "GET")
	public ResponseEntity<Iterable<Empleado>> findEmpleadosByEmpresa(@RequestParam(value = "empresa") String empresa) {
		return new ResponseEntity<Iterable<Empleado>>(catalogoService.findEmpleadosByEmpresa(empresa), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/supervisoresOperacion")
	@ApiOperation(value = "Retorna listado de supervisores de operación", httpMethod = "GET")
	public ResponseEntity<Iterable<SupervisorOperacion>> findSupervisorOperacion(@RequestParam(value = "empresa") String empresa){
		return new ResponseEntity<Iterable<SupervisorOperacion>>(catalogoService.findSupervisoresOperacion(empresa, null, null), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/supervisoresOperacion/default")
	@ApiOperation(value = "Retorna el supervisor de operación por default", httpMethod = "GET")
	public ResponseEntity<SupervisorOperacion> findSupervisorOperacionDefault(@RequestParam(value = "empresa") String empresa){
		return new ResponseEntity<SupervisorOperacion>(catalogoService.findSupervisorOperacionDefault(empresa), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/agencias/default")
	@ApiOperation(value = "Retorna la agencia default del usuario autenticado", httpMethod = "GET")
	public ResponseEntity<Agencia> findAgenciaDefault(@RequestParam(value = "empresa") String empresa){
		return new ResponseEntity<Agencia>(catalogoService.findAgenciaDefault(empresa), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/agencias")
	@ApiOperation(value = "Retorna listado de agencias", httpMethod = "GET")
	public ResponseEntity<Iterable<Agencia>> findAgencias(@RequestParam(value = "empresa") String empresa){
		return new ResponseEntity<Iterable<Agencia>>(catalogoService.findAgencias(empresa), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/rutas")
	@ApiOperation(value = "Retorna listado de rutas", httpMethod = "GET")
	public ResponseEntity<Iterable<Ruta>> findRutas(@RequestParam(value = "codigo", required = false, defaultValue = "0") Integer codigo){
		return new ResponseEntity<Iterable<Ruta>>(catalogoService.findRutas(codigo), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/paisesOrigen")
	@ApiOperation(value = "Retorna listado de paises origen", httpMethod = "GET")
	public ResponseEntity<Iterable<Pais>> findPaisesOrigen(@RequestParam(value = "codigo", required = false) String codigo) {
		return new ResponseEntity<Iterable<Pais>>(catalogoService.findPaises(codigo), HttpStatus.OK);
	}

	@RequestMapping(value = "/clasesCliente")
	@ApiOperation(value = "Retorna listado de clases de cliente", httpMethod = "GET")
	public ResponseEntity<Iterable<ClaseCliente>> findClasesCliente() {
		return new ResponseEntity<Iterable<ClaseCliente>>(catalogoService.findClasesCliente(), HttpStatus.OK);
	}

	@RequestMapping(value = "/tiposCliente")
	@ApiOperation(value = "Retorna listado de tipos de cliente", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoCliente>> findTiposCliente() {
		return new ResponseEntity<Iterable<TipoCliente>>(catalogoService.findTiposCliente(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/vinculaciones")
	@ApiOperation(value = "Retorna listado de vinculaciones", httpMethod = "GET")
	public ResponseEntity<Iterable<Vinculacion>> findVinculaciones() {
		return new ResponseEntity<Iterable<Vinculacion>>(catalogoService.findVinculaciones(), HttpStatus.OK);
	}

	@RequestMapping(value = "/instituciones")
	@ApiOperation(value = "Retorna listado de instituciones", httpMethod = "GET")
	public ResponseEntity<Iterable<Institucion>> findInstituciones(@RequestParam(value = "tipo", required = false) Integer tipo) {
		return new ResponseEntity<Iterable<Institucion>>(catalogoService.findInstituciones(tipo), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/tiposInstituciones")
	@ApiOperation(value = "Retorna listado de tipos de instituciones", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoInstitucion>> findTiposInstituciones() {
		return new ResponseEntity<Iterable<TipoInstitucion>>(catalogoService.findTipoInstituciones(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/zonas")
	@ApiOperation(value = "Retorna listado de zonas", httpMethod = "GET")
	public ResponseEntity<Iterable<Zona>> findZonas(@RequestParam(value = "codigo", required = false) Integer codigo){
		return new ResponseEntity<Iterable<Zona>>(catalogoService.findZonas(codigo), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/direcciones")
	@ApiOperation(value = "Retorna las direcciones por barrio", httpMethod = "GET")
	public ResponseEntity<Iterable<NivelGeografico>> findDireccion(@RequestParam(value = "nombreBarrio", required = false) String nombreBarrio){
		return new ResponseEntity<Iterable<NivelGeografico>>(catalogoService.findDireccion(nombreBarrio), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/documentosRequeridos")
	@ApiOperation(value = "Retorna listado de documentos requeridos por clase de cliente", httpMethod = "GET")
	public ResponseEntity<Iterable<DocumentoRequerido>> findDocumentosRequeridosPorClaseCliente(
		@RequestParam(value = "claseCliente", required = false) Integer claseCliente) {
		return new ResponseEntity<Iterable<DocumentoRequerido>>(catalogoService.findDocumentosRequeridosPorClaseCliente(claseCliente), HttpStatus.OK);
	}

	@RequestMapping(value = "/regiones")
	@ApiOperation(value = "Retorna listado de regiones", httpMethod = "GET")
	public ResponseEntity<Iterable<Region>> findRegiones() {
		return new ResponseEntity<Iterable<Region>>(catalogoService.findRegiones(), HttpStatus.OK);
	}

	@RequestMapping(value = "/departamentos")
	@ApiOperation(value = "Retorna listado de departamentos", httpMethod = "GET")
	public ResponseEntity<Iterable<Departamento>> findDepartamentos(@RequestParam(value = "codigo", required = false) Integer codigo) {
		return new ResponseEntity<Iterable<Departamento>>(catalogoService.findDepartamentos(codigo), HttpStatus.OK);
	}

	@RequestMapping(value = "/municipios")
	@ApiOperation(value = "Retorna listado de municipios", httpMethod = "GET")
	public ResponseEntity<Iterable<Municipio>> findMunicipios(@RequestParam(value = "codigo", required = false) Integer codigo) {
		return new ResponseEntity<Iterable<Municipio>>(catalogoService.findMunicipios(codigo), HttpStatus.OK);
	}

	@RequestMapping(value = "/barrios")
	@ApiOperation(value = "Retorna listado de barrios", httpMethod = "GET")
	public ResponseEntity<Iterable<Barrio>> findBarrios(@RequestParam(value = "codigo", required = false) Integer codigo) {
		return new ResponseEntity<Iterable<Barrio>>(catalogoService.findBarrios(codigo), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/nivelRiesgo")
	@ApiOperation(value = "Retorna listado de niveles de riesgo", httpMethod = "GET")
	public ResponseEntity<Iterable<NivelRiesgo>> findNivelesRiesgo(
		@RequestParam(value = "region", required = false) Integer region,
		@RequestParam(value = "departamento", required = false) Integer departamento,
		@RequestParam(value = "municipio", required = false) Integer municipio,
		@RequestParam(value = "barrio", required = false) Integer barrio) {
		return new ResponseEntity<Iterable<NivelRiesgo>>(catalogoService.findNivelRiesgo(region, departamento, municipio, barrio), HttpStatus.OK);
	}

	@RequestMapping(value = "/tipoDirecciones")
	@ApiOperation(value = "Retorna listado de regiones", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoDireccion>> findTiposDirecciones() {
		return new ResponseEntity<Iterable<TipoDireccion>>(catalogoService.findTiposDirecciones(), HttpStatus.OK);
	}

	@RequestMapping(value = "/referenciasIngreso")
	@ApiOperation(value = "Retorna listado de referencias a ingresar", httpMethod = "GET")
	public ResponseEntity<Iterable<ReferenciaClienteDetalle>> findReferenciasTipoCliente(@RequestParam(value = "tipoPersona") TipoPersona tipoPersona) {
		return new ResponseEntity<Iterable<ReferenciaClienteDetalle>>(referenciaClienteDetalleService.findReferenciaClienteDetalleByUso(tipoPersona), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/referenciasIngreso/{tipoReferencia}")
	@ApiOperation(value = "Retorna configuración de la referencia según el tipo y uso", httpMethod = "GET")
	public ResponseEntity<ReferenciaClienteDetalle> findReferenciasTipoCliente(
		@PathVariable("tipoReferencia") String tipoReferencia, 
		@RequestParam(value = "tipoPersona") TipoPersona tipoPersona) {
		return new ResponseEntity<ReferenciaClienteDetalle>(referenciaClienteDetalleService.findReferenciaClienteDetalleByReferenciaTipoReferenciaAndUso(tipoReferencia, tipoPersona), HttpStatus.OK);
	}

	@RequestMapping(value = "/tiposReferencias")
	@ApiOperation(value = "Retorna listado de tipos de referencias a ingresar", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoReferencia>> findTipoReferencias() {
		return new ResponseEntity<Iterable<TipoReferencia>>(catalogoService.findTiposReferencias(), HttpStatus.OK);
	}

	@RequestMapping(value = "/tiposSociedades")
	@ApiOperation(value = "Retorna listado de tipos de sociedades", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoSociedad>> findTiposSociedades() {
		return new ResponseEntity<Iterable<TipoSociedad>>(catalogoService.findTiposSociedades(), HttpStatus.OK);
	}
   
	@RequestMapping(value = "/nivelesVentas")
	@ApiOperation(value = "Retorna listado de niveles de ventas", httpMethod = "GET")
	public ResponseEntity<Iterable<NivelVentas>> findNivelesVentas() {
		return new ResponseEntity<Iterable<NivelVentas>>(catalogoService.findNivelesVentas(), HttpStatus.OK);
	}

	@RequestMapping(value = "/rangoSueldos")
	@ApiOperation(value = "Retorna listado de rangos de sueldo", httpMethod = "GET")
	public ResponseEntity<Iterable<RangoSueldos>> findRangosSueldos() {
		return new ResponseEntity<Iterable<RangoSueldos>>(catalogoService.findRangosSueldos(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/gruposEconomicos")
	@ApiOperation(value = "Retorna listado de grupos económicos", httpMethod = "GET")
	public ResponseEntity<Iterable<GrupoEconomico>> findGruposEconomicos() {
		return new ResponseEntity<Iterable<GrupoEconomico>>(catalogoService.findGruposEconomicos(), HttpStatus.OK);
	}
	
	/** DP **/
	
	@RequestMapping(value = "/tipoProductos")
	@ApiOperation(value = "Retorna listado de tipos de producto", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoProducto>> findTipoProductos() {
		return new ResponseEntity<Iterable<TipoProducto>>(catalogoService.findTipoProductos(null), HttpStatus.OK);
	}

	@RequestMapping(value = "/productos")
	@ApiOperation(value = "Retorna listado de productos", httpMethod = "GET")
	public ResponseEntity<Iterable<ProductoResumen>> findProductos(
		@RequestParam(value = "moneda", required = false) String moneda, 
		@RequestParam(value = "tipoProducto", required = false) Integer tipoProducto) {
		return new ResponseEntity<Iterable<ProductoResumen>>(catalogoService.findProductoResumenByMonedaAndTipoProducto(moneda, tipoProducto), HttpStatus.OK);
	}

	@RequestMapping(value = "/productos/{producto}/{subProducto}")
	@ApiOperation(value = "Retorna información del producto", httpMethod = "GET")
	public ResponseEntity<ProductoDTO> findProducto(
		@PathVariable("producto") Integer producto, 
		@PathVariable("subProducto") Integer subProducto) {
		return new ResponseEntity<ProductoDTO>(catalogoService.findProducto(producto, subProducto), HttpStatus.OK);
	}

	@RequestMapping(value = "/origenesFondo")
	@ApiOperation(value = "Retorna listado de orígenes fondo para abrir cuenta", httpMethod = "GET")
	public ResponseEntity<Iterable<OrigenFondo>> findOrigenesFondo() {
		return new ResponseEntity<Iterable<OrigenFondo>>(catalogoService.findOrigenesFondo(null), HttpStatus.OK);
	}

	@RequestMapping(value = "/usosCuenta")
	@ApiOperation(value = "Retorna listado de usos de cuenta", httpMethod = "GET")
	public ResponseEntity<Iterable<UsoCuenta>> findUsosCuenta() {
		return new ResponseEntity<Iterable<UsoCuenta>>(catalogoService.findUsosCuenta(null), HttpStatus.OK);
	}

	@RequestMapping(value = "/promociones")
	@ApiOperation(value = "Retorna listado de promociones", httpMethod = "GET")
	public ResponseEntity<Iterable<Promocion>> findPromociones() {
		return new ResponseEntity<Iterable<Promocion>>(catalogoService.findPromociones(null), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/tiposChequera")
	@ApiOperation(value = "Retorna listado de tipos de chequera", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoChequera>> findTipoChequera(@RequestParam(value = "moneda", required = false) String moneda) {
		return new ResponseEntity<Iterable<TipoChequera>>(catalogoService.findTipoChequera(null, moneda), HttpStatus.OK);
	}

	@RequestMapping(value = "/parentescos")
	@ApiOperation(value = "Retorna listado de parentescos", httpMethod = "GET")
	public ResponseEntity<Iterable<Parentesco>> findParentescos() {
		return new ResponseEntity<Iterable<Parentesco>>(catalogoService.findParentescos(null), HttpStatus.OK);
	}

	@RequestMapping(value = "/tiposFormaPagoInteres")
	@ApiOperation(value = "Retorna listado de tipos de forma de pago de interes", httpMethod = "GET")
	public ResponseEntity<Iterable<TipoFormaPagoInteres>> findTiposFormaPagoInteres() {
		return new ResponseEntity<Iterable<TipoFormaPagoInteres>>(catalogoService.findTiposFormaPagoInteres(null), HttpStatus.OK);
	}

	@RequestMapping(value = "/frecuencias")
	@ApiOperation(value = "Retorna listado de frecuencias", httpMethod = "GET")
	public ResponseEntity<Iterable<Frecuencia>> findFrecuencias() {
		return new ResponseEntity<Iterable<Frecuencia>>(catalogoService.findFrecuencias(null), HttpStatus.OK);
	}

}
