package com.bytesw.platform.bs.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

import com.bytesw.platform.eis.bo.depositos.ProductoEspecial;
import com.bytesw.platform.eis.bo.depositos.identifier.CuentaId;
import org.hibernate.service.spi.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.bytesw.platform.bs.exception.AuthorizationRequiredException;
import com.bytesw.platform.bs.service.CuentaService;
import com.bytesw.platform.bs.service.ReporteService;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.depositos.CuentaResumen;
import com.bytesw.platform.eis.bo.depositos.CuentaSeccionPendiente;
import com.bytesw.platform.eis.bo.depositos.TransaccionEquivalente;
import com.bytesw.platform.eis.bo.plataforma.CampoProducto;
import com.bytesw.platform.eis.bo.plataforma.ServicioElectronico;
import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;
import com.bytesw.platform.eis.dto.depositos.BeneficiarioDTO;
import com.bytesw.platform.eis.dto.depositos.BeneficiarioFinalDTO;
import com.bytesw.platform.eis.dto.depositos.CuentaDTO;
import com.bytesw.platform.eis.dto.depositos.CuentaResponseDTO;
import com.bytesw.platform.eis.dto.depositos.FirmanteDTO;
import com.bytesw.platform.eis.dto.depositos.PersonaChequeraDTO;
import com.bytesw.platform.eis.dto.depositos.PersonaMancomunadaDTO;
import com.bytesw.platform.eis.dto.depositos.PlanFuturoCreceDTO;
import com.bytesw.platform.eis.dto.depositos.TasaInteresCalculoDTO;
import com.bytesw.platform.utilities.Permission;
import com.bytesw.platform.utilities.SeccionFormularioCuenta;
import com.lowagie.text.pdf.codec.Base64;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api/cuentas", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Cuenta")
public class CuentaController {

	protected Logger logger = Logger.getLogger(getClass().getName());
	
	private CuentaService cuentaService;
	private ReporteService reportService;
	
	@Autowired
	public CuentaController(CuentaService cuentaService, ReporteService reportService) {
		this.cuentaService = cuentaService;
		this.reportService = reportService;
	}

	@RequestMapping()
	@ApiOperation(value = "Retorna listado de cuentas del cliente", httpMethod = "GET")
	public ResponseEntity<Iterable<CuentaResumen>> findCuentasByClienteId(
		@RequestParam(value = "tipoDocumento", required = true, defaultValue = " ") String tipoDocumento, 
		@RequestParam(value = "documento", required = true) String documento, 
		@RequestParam(value = "excluir", required = false) List<Integer> excluir, 
		@RequestParam(value = "estados", required = false) List<String> estados, 
		@RequestParam(value = "monedas", required = true) List<String> monedas) {
		return new ResponseEntity<Iterable<CuentaResumen>>(cuentaService.findAllCuentas(tipoDocumento, documento, excluir, estados, monedas), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/portal")
	@ApiOperation(value = "Retorna datos de la cuenta para presentación en el portal web", httpMethod = "GET")
	public ResponseEntity<CuentaResumen> findByNumeroCuenta(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaResumen>(cuentaService.findCuentaToPortal(numeroCuenta), HttpStatus.OK);
	}

	@RequestMapping(value = "/fechaOperacion")
	@ApiOperation(value = "Recupera la fecha de operación del as400", httpMethod = "GET")
	public ResponseEntity<Date> findFechaOperation(@RequestParam(value = "empresa") String empresa) {
		return new ResponseEntity<Date>(cuentaService.findFechaOperacion(empresa), HttpStatus.OK);
	}

	@RequestMapping(value = "/transacciones/{equivalente}")
	@ApiOperation(value = "Recupera la transacción equivalente", httpMethod = "GET")
	public ResponseEntity<TransaccionEquivalente> findTransaccionEquivalente(
		@PathVariable("equivalente") String equivalente, 
		@RequestParam(value = "moneda") String moneda, 
		@RequestParam(value = "tipoProducto") Integer tipoProducto) {
		return new ResponseEntity<TransaccionEquivalente>(cuentaService.findTransaccionEquivalente(equivalente, moneda, tipoProducto), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/serviciosElectronicos")
	@ApiOperation(value = "Recupera los servicios electrónicos disponibles para el tipo de persona", httpMethod = "GET")
	public ResponseEntity<List<ServicioElectronico>> findServiciosElectronicos(
		@RequestParam(value = "tipoPersona") TipoPersona tipoPersona, 
		@RequestParam("producto") Integer producto, 
		@RequestParam("subProducto") Integer subProducto) {
		return new ResponseEntity<List<ServicioElectronico>>(cuentaService.findServiciosElectronicos(tipoPersona, producto, subProducto), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/planes/ahorros/futuroCrece")
	@ApiOperation(value = "Recupera el listado de planes de ahorro de futuro crece", httpMethod = "GET")
	public ResponseEntity<List<PlanFuturoCreceDTO>> findPlanFuturoCrece(@RequestParam(value = "moneda") String moneda) {
		return new ResponseEntity<List<PlanFuturoCreceDTO>>(cuentaService.findPlanFuturoCrece(moneda), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/campos")
	@ApiOperation(value = "Recupera el campo según el producto", httpMethod = "GET")
	public ResponseEntity<CampoProducto> findCampoProducto(
		@RequestParam(value = "campo") String campo,
		@RequestParam(value = "producto") Integer producto,
		@RequestParam(value = "subProducto") Integer subProducto) {
		return new ResponseEntity<CampoProducto>(cuentaService.findCampoProducto(producto, subProducto, campo), HttpStatus.OK);
	}

	@RequestMapping(value = "/productoEspecial", method = RequestMethod.POST)
	@ApiOperation(value = "Recupera el producto especial según el identificador de la cuenta", httpMethod = "POST")
	public ResponseEntity<ProductoEspecial> findProductoEspecialByCuentaId(@RequestBody CuentaId id) {
		return new ResponseEntity<ProductoEspecial>(cuentaService.findProductoEspecialByCuentaId(id), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/tasaInteres", method = RequestMethod.POST)
	@ApiOperation(value = "Cálcula tasa interés y fecha de vencimiento en base al valor de apertura y el plazo en días", httpMethod = "POST")
	public ResponseEntity<TasaInteresCalculoDTO> findTasaInteresPorValorApertura(
		@RequestBody CuentaDTO cuenta, 
		@RequestParam(value = "empresa") String empresa) {
		return new ResponseEntity<TasaInteresCalculoDTO>(cuentaService.findTasaInteresResumen(cuenta, empresa), HttpStatus.OK);
	}

	// VALIDACIONES Y APERTURA DE CUENTA
	
	@RequestMapping(value = "/validarFormulario", method = RequestMethod.POST)
	@ApiOperation(value = "Valida las secciones del formulario", httpMethod = "POST")
	public ResponseEntity<Boolean> validateSeccion(
		@RequestBody CuentaDTO cuenta,
		@RequestParam(value = "empresa") String empresa,
		@RequestParam(value = "seccion") SeccionFormularioCuenta seccion) {
		return new ResponseEntity<Boolean>(cuentaService.validate(cuenta, empresa, seccion), HttpStatus.OK);
	}

	@RequestMapping(method = RequestMethod.POST)
	@ApiOperation(value = "Permite crear una cuenta", httpMethod = "POST")
	public ResponseEntity<CuentaResponseDTO> save(
		@RequestBody CuentaDTO cuenta, 
		@RequestParam(value = "empresa") String empresa,
		UriComponentsBuilder builder) {
		CuentaResponseDTO response = new CuentaResponseDTO();
		cuenta = cuentaService.save(empresa, cuenta);
		response.setDigitoIdentificador(cuenta.getDigitoIdentificador());
		response.setAgencia(cuenta.getAgencia());
		response.setCorrelativo(cuenta.getCorrelativo());
		response.setDigitoVerificador(cuenta.getDigitoVerificador());
		response.setMoneda(cuenta.getMoneda().getDescripcion());
		response.setTipoProducto(cuenta.getTipoProducto().getDescripcion());
		response.setProducto(cuenta.getProducto().getDescripcion());
		response.setNumeroCuenta(cuenta.getNumeroCuenta());
		response.setNombre(cuenta.getDatoGeneral().getNombreRecortado());
		response.setEstado(cuenta.getEstado());
		response.setPersonasAsociadas(new ArrayList<ClienteResumenDTO>(cuenta.getPersonasRelacionadas()));
		response.setServiciosElectronicos(new ArrayList<ServicioElectronico>(cuenta.getServiciosElectronicos()));
		cuentaService.afterTransactionSave(cuenta);
		return new ResponseEntity<CuentaResponseDTO>(response, HttpStatus.CREATED);
	}
	
	@RequestMapping(value = "/beneficiarios/validate", method = RequestMethod.POST)
	@ApiOperation(value = "Permite validar un beneficiario al momento de asociarlo a la cuenta", httpMethod = "POST")
	public ResponseEntity<Boolean> validateBeneficiario(@RequestBody BeneficiarioDTO beneficiario){
		return new ResponseEntity<Boolean>(cuentaService.validateBeneficiario(beneficiario.getTipoDocumento().getCodigo(), beneficiario.getNumeroDocumento()), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/beneficiariosFinales/validate", method = RequestMethod.POST)
	@ApiOperation(value = "Permite validar un beneficiario final al momento de asociarlo a la cuenta", httpMethod = "POST")
	public ResponseEntity<Boolean> validateBeneficiarioFinal(@RequestBody BeneficiarioFinalDTO beneficiario){
		return new ResponseEntity<Boolean>(cuentaService.validateBeneficiario(beneficiario.getTipoDocumento().getCodigo(), beneficiario.getNumeroDocumento()), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/personasMancomunadas/validate", method = RequestMethod.POST)
	@ApiOperation(value = "Permite validar una persona mancomunada al momento de asociarla a la cuenta", httpMethod = "POST")
	public ResponseEntity<Boolean> validatePersonaMancomunada(@RequestBody PersonaMancomunadaDTO persona){
		return new ResponseEntity<Boolean>(cuentaService.validatePersonaMancomunada(persona), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/personasAutorizadas/validate", method = RequestMethod.POST)
	@ApiOperation(value = "Permite validar personas autorizadas a recoger chequera al momento de asociarla a la cuenta", httpMethod = "POST")
	public ResponseEntity<Boolean> validatePersonaAutorizada(@RequestBody PersonaChequeraDTO persona){
		return new ResponseEntity<Boolean>(cuentaService.validatePersonaAutorizada(persona), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/firmantes/validate", method = RequestMethod.POST)
	@ApiOperation(value = "Permite validar un firmante al momento de asociarlo a la cuenta", httpMethod = "POST")
	public ResponseEntity<Boolean> validateFirmante(@RequestBody FirmanteDTO firmante){
		return new ResponseEntity<Boolean>(cuentaService.validateFirmante(firmante), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/clienteEsBeneficiarioFinal", method = RequestMethod.POST)
	@ApiOperation(value = "Permite validar si el cliente es el beneficiario final de la cuenta", httpMethod = "POST")
	public ResponseEntity<Boolean> isClienteBeneficiarioFinal(@PathVariable("numeroCuenta") String numeroCuenta){
		return new ResponseEntity<Boolean>(cuentaService.isClienteBeneficiarioFinal(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/nombre")
	@ApiOperation(value = "Retorna el nombre de la cuenta para posteriormente actualizarlo", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateNombre(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateNombre(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/datoGeneral")
	@ApiOperation(value = "Retorna los datos generales para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateDatoGeneral(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateDatoGeneral(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/chequera")
	@ApiOperation(value = "Retorna los datos de la chequera para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateChequera(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateChequera(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/datoInteres")
	@ApiOperation(value = "Retorna los datos de interes para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateDatoInteres(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateDatoInteres(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/beneficiarios")
	@ApiOperation(value = "Retorna los beneficiarios para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateBeneficiarios(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateBeneficiarios(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/beneficiariosFinales")
	@ApiOperation(value = "Retorna los beneficiarios finales para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateBeneficiariosFinales(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateBeneficiariosFinales(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/firmas")
	@ApiOperation(value = "Retorna las firmas para posteriormente actualizarlas", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateFirmas(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateFirmas(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/serviciosElectronicos")
	@ApiOperation(value = "Retorna los servicios electrónicos para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateServiciosElectronicos(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateServiciosElectronicos(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/personasAsociadas")
	@ApiOperation(value = "Retorna las personas asociadas para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdatePersonasAsociadas(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdatePersonasAsociadas(numeroCuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/plazoFijo")
	@ApiOperation(value = "Retorna los datos del plazo fijo", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToViewPlazoFijo(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToViewPlazoFijo(numeroCuenta), HttpStatus.OK);
	}

	@RequestMapping(value = "/{numeroCuenta}/cuentasTraslados")
	@ApiOperation(value = "Retorna las cuentas de traslados para posteriormente actualizarlos ", httpMethod = "GET")
	public ResponseEntity<CuentaDTO> findCuentaToUpdateCuentasTraslados(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.findCuentaToUpdateCuentasTraslados(numeroCuenta), HttpStatus.OK);
	}

	@RequestMapping(value = "/{numeroCuenta}/nombre", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar el nombre de la cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateNombre(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateNombre(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/datoGeneral", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar los datos generales de la cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateDatoGeneral(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateDatoGeneral(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/chequera", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar los datos de administración de chequera", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateChequera(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateChequera(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/datoInteres", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar los datos de administración de intereses", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateDatoInteres(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateDatoInteres(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/beneficiarios", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar los beneficiarios de la cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateBeneficiarios(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateBeneficiarios(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/beneficiariosFinales", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar los beneficiarios finales de la cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateBeneficiariosFinales(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateBeneficiariosFinales(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/firmas", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar las firmas de la cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateFirmas(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateFirmas(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/serviciosElectronicos", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar los servicios electrónicos de la cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateServiciosElectronicos(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateServiciosElectronicos(cuenta), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{numeroCuenta}/personasAsociadas", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar clientes mancomunados de la cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updatePersonasAsociadas(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updatePersonasAsociadas(cuenta), HttpStatus.OK);
	}

	@RequestMapping(value = "/{numeroCuenta}/cuentasTraslados", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite modificar las cuentas de traslados de una cuenta", httpMethod = "PUT")
	public ResponseEntity<CuentaDTO> updateCuentasTraslados(@RequestBody CuentaDTO cuenta) {
		return new ResponseEntity<CuentaDTO>(cuentaService.updateCuentasTraslados(cuenta), HttpStatus.OK);
	}

	/** SOLICITUD DE AUTORIZACIÓN **/
	
	@RequestMapping(value = "/permiso/reimpresion", method = RequestMethod.POST)
	@ApiOperation(value = "Retorna permiso para reimpresion de formularios", httpMethod = "POST")
	public ResponseEntity<Void> permisoReimpresion() {
		throw new AuthorizationRequiredException(Permission.REIMPFOR);
	}

	@RequestMapping(value = "/reporte", method = RequestMethod.POST)
	@ApiOperation(value = "Recupera la transacción equivalente", httpMethod = "POST")
	public ResponseEntity<String> generarReporte(@RequestBody CuentaResponseDTO cuenta, @RequestParam(value = "empresa") String empresa) {
		byte[] bt = null;
		try {
			bt = reportService.generarReporte(empresa, cuenta);
		} catch (ServiceException e) {
			e.printStackTrace();
		}
		String stringToStore = new String(Base64.encodeBytes(bt));
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.parseMediaType("application/pdf"));
		String filename = "output.pdf";
		headers.setContentDispositionFormData(filename, filename);
		headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
		ResponseEntity<String> response = new ResponseEntity<String>(stringToStore, headers, HttpStatus.OK);
		return response;
	}

	@RequestMapping(value = "/reimpresion", method = RequestMethod.POST)
	@ApiOperation(value = "Recupera la transacción equivalente")
	public ResponseEntity<String> reimpresion(@RequestBody CuentaResponseDTO cuenta, @RequestParam(value = "empresa") String empresa, @RequestParam(value = "supervisor") Integer supervisor) {                                                
		byte[] bt = null;
		try {                                                        
			bt = reportService.generarReporte(empresa, cuenta, supervisor);
		} catch (ServiceException e) {
			e.printStackTrace();
		}
		String stringToStore = new String(Base64.encodeBytes(bt));
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.parseMediaType("application/pdf"));
		String filename = "output.pdf";
		headers.setContentDispositionFormData(filename, filename);
		headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
		ResponseEntity<String> response = new ResponseEntity<String>(stringToStore, headers, HttpStatus.OK);
		return response;
	}
	
	@RequestMapping(value = "/{numeroCuenta}/resumenSeccionesPendientes", method = RequestMethod.GET)
	@ApiOperation(value = "Permite identificar secciones que están incompletas", httpMethod = "GET")
	public ResponseEntity<CuentaSeccionPendiente> findSeccionesPendientesByCuenta(@PathVariable("numeroCuenta") String numeroCuenta) {
		return new ResponseEntity<CuentaSeccionPendiente>(cuentaService.findSeccionesPendientesByCuenta(numeroCuenta), HttpStatus.OK);
	}

}
