 package com.bytesw.platform.bs.controller;

import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.bytesw.platform.eis.dto.clientes.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.MatrixVariable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.bytesw.platform.bs.service.ClienteService;
import com.bytesw.platform.eis.bo.clientes.CambioSituacionEconomicaSeccion;
import com.bytesw.platform.eis.bo.clientes.ClienteResumen;
import com.bytesw.platform.eis.bo.clientes.ClienteSeccionPendiente;
import com.bytesw.platform.eis.bo.clientes.GrupoEconomico;
import com.bytesw.platform.eis.dto.SearchDTO;
import com.bytesw.platform.utilities.SeccionFormularioCliente;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api/clientes", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Cliente")
public class ClienteController {

	protected Logger logger = Logger.getLogger(getClass().getName());

	private ClienteService clienteService;
	
	@Autowired
	public ClienteController(ClienteService clienteService) {
		this.clienteService = clienteService;
	}
	
	@RequestMapping(method = RequestMethod.POST)
	@ApiOperation(value = "Retorna listado de clientes", httpMethod = "POST")
	public ResponseEntity<Iterable<ClienteResumen>> findAll(Pageable page, @RequestBody SearchDTO request) {
		return new ResponseEntity<Iterable<ClienteResumen>>(clienteService.findAll(request, page), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}")
	@ApiOperation(value = "Retorna información del cliente por identificación", httpMethod = "GET")
	public ResponseEntity<ClienteInformacionDTO> findById(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteInformacionDTO>(clienteService.findCliente(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/avatar", produces = MediaType.IMAGE_PNG_VALUE)
	@ApiOperation(value = "Retorna avatar de un cliente natural", httpMethod = "GET")
	public ResponseEntity<byte[]> findFotoByClienteId(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		byte[] image = clienteService.findAvatarByClienteId(tipoIdentificacion, identificacion);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.IMAGE_PNG);
		headers.setContentLength(image.length);
		return new ResponseEntity<byte[]>(image, headers, HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/portal")
	@ApiOperation(value = "Retorna datos del cliente para presentación en el portal web", httpMethod = "GET")
	public ResponseEntity<ClienteResumen> findByIdToPortal(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteResumen>(clienteService.findClienteToPortal(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/registroPersonas")
	@ApiOperation(value = "Retorna cliente de registro de personas", httpMethod = "GET")
	public ResponseEntity<ClienteResumenDTO> findDatosRegistroPersonas(
		@RequestParam(value = "tipoIdentificacion", required = true) String tipoDeIdentificacion,
		@RequestParam(value = "numeroIdentificacion", required = true) String numeroIdentificacion) {
		return new ResponseEntity<ClienteResumenDTO>(clienteService.getDatosRegistroPersonas(tipoDeIdentificacion, numeroIdentificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/registroPersonas/autorizaciones")
	@ApiOperation(value = "Verifica si pide autorización en el registro de personas", httpMethod = "GET")
	public ResponseEntity<Void> autorizaRegistroPersona(){
		clienteService.autorizaRegistroPersonas();
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
   
	@RequestMapping(value = "/validarFormulario", method = RequestMethod.POST)
	@ApiOperation(value = "Valida las secciones del formulario", httpMethod = "POST")
	public ResponseEntity<Boolean> validateSeccion(
		@RequestBody ClienteDTO clienteDTO,
		@RequestParam(value = "seccion") SeccionFormularioCliente seccion, 
		UriComponentsBuilder builder) {
		return new ResponseEntity<Boolean>(clienteService.validateSeccion(clienteDTO, seccion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/validarIdentificacion", method = RequestMethod.POST)
	@ApiOperation(value = "Valida la identificación de un cliente", httpMethod = "POST")
	public ResponseEntity<Boolean> validateIdentificacion(
		@RequestParam(value = "tipoIdentificacion") String tipoIdentificacion, 
		@RequestParam(value = "identificacion") String identificacion,
		UriComponentsBuilder builder) {
		return new ResponseEntity<Boolean>(clienteService.validateIdentificacion(tipoIdentificacion, identificacion), HttpStatus.OK);
	}

	@RequestMapping(value = "/validateAddressToDelete", method = RequestMethod.POST)
	@ApiOperation(value = "Valida si la dirección esta asociada a una cuenta", httpMethod = "POST")
	public ResponseEntity<Boolean> validateAddressToDelete(
        @RequestParam(value = "tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion,
        @RequestParam(value = "identificacion") String identificacion,
        @RequestParam(value = "correlativoDireccion") Integer correlativoDireccion) {
	    DireccionDTO d = new DireccionDTO();
	    d.setTipoDocumento(tipoIdentificacion);
	    d.setDocumento(identificacion);
	    d.setCorrelativoDireccion(correlativoDireccion);
		return new ResponseEntity<Boolean>(clienteService.validateAddressToDelete(d), HttpStatus.OK);
	}
	 
	@RequestMapping(value = "/save", method = RequestMethod.POST)
	@ApiOperation(value = "Permite almacenar un cliente", httpMethod = "POST")
	public ResponseEntity<ClienteDTO> save(
		@RequestBody ClienteDTO clienteDTO, 
		@RequestParam(value = "empresa") String empresa, 
		UriComponentsBuilder builder) {
		return new ResponseEntity<ClienteDTO>(clienteService.save(empresa, clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/saveReferencias", method = RequestMethod.POST)
	@ApiOperation(value = "Permite almacenar las referencias de un cliente", httpMethod = "POST")
	public ResponseEntity<ClienteDTO> saveReferencias(
		@RequestBody ClienteDTO clienteDTO,
		@RequestParam(value = "empresa") String empresa, 
		UriComponentsBuilder builder) {
	    return new ResponseEntity<ClienteDTO>(clienteService.saveReferencias(empresa, clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/tipoEdad")
	@ApiOperation(value = "Retorna si la edad de un cliente es menor de edad o de tercera edad", httpMethod = "GET")
	public ResponseEntity<TipoEdadClienteDTO> findClienteMenorEdadOrTerceraEdad(
		@RequestParam(value = "edad", required = true) Integer edad) {
		return new ResponseEntity<TipoEdadClienteDTO>(clienteService.getTipoEdadCliente(edad), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/gruposEconomicos")
	@ApiOperation(value = "Retorna los grupos económicos por cliente", httpMethod = "GET")
	public ResponseEntity<Iterable<GrupoEconomico>> findGrupoEconomicoByCliente(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<Iterable<GrupoEconomico>>(clienteService.findGrupoEconomicoByCliente(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/nombre")
	@ApiOperation(value = "Retorna nombre del cliente para posteriormente actualizarlo", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdateNombre(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateNombre(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/datosGenerales")
	@ApiOperation(value = "Retorna datos generales del cliente para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdateDatosGenerales(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateDatosGenerales(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/dependientes")
	@ApiOperation(value = "Retorna listado de dependientes de un cliente para posteriormente actualizarlo", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdateDependientes(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateDependientes(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/perfilEconomico")
	@ApiOperation(value = "Retorna datos del perfil económico del cliente para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdatePerfilEconomico(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdatePerfilEconomico(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/representanteLegal")
	@ApiOperation(value = "Retorna datos del representante legal para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdateRepresentanteLegal(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateRepresentanteLegal(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/datosAdicionales")
	@ApiOperation(value = "Retorna datos adicionales del cliente para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdateDatosAdicionales(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateDatosAdicionales(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/documentosPresentados")
	@ApiOperation(value = "Retorna los documentos presentados del cliente para posteriormente actualizarlos", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdateDocumentosPresentados(
		@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
		@PathVariable("identificacion") String identificacion) {
		return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateDocumentosPresentados(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/direcciones")
	@ApiOperation(value = "Retorna datos las direcciones del cliente para posteriormente actualizarlas", httpMethod = "GET")
	public ResponseEntity<ClienteDTO> findByIdToUpdateDirecciones(
	    @MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
	    @PathVariable("identificacion") String identificacion) {
	    return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateDirecciones(tipoIdentificacion, identificacion), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/cambio/referencias")
    @ApiOperation(value = "Retorna datos las referencias del cliente para posteriormente actualizarlas", httpMethod = "GET")
    public ResponseEntity<ClienteDTO> findClienteToUpdateReferencias(
        @MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
        @PathVariable("identificacion") String identificacion) {
        return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateReferencias(tipoIdentificacion, identificacion), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/cambio/referenciasLaborales")
    @ApiOperation(value = "Retorna datos de las Referencias Laborales del cliente para posteriormente actualizarlas", httpMethod = "GET")
    public ResponseEntity<ClienteDTO> findClienteToUpdateReferenciasLaborales(
        @MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
        @PathVariable("identificacion") String identificacion) {
        return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateReferenciasLaborales(tipoIdentificacion, identificacion), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/cambio/referenciasProveedores")
    @ApiOperation(value = "Retorna datos de las Referencias de Proveedor del cliente para posteriormente actualizarlas", httpMethod = "GET")
    public ResponseEntity<ClienteDTO> findClienteToUpdateReferenciaProveedor(
        @MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
        @PathVariable("identificacion") String identificacion) {
        return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateReferenciaProveedor(tipoIdentificacion, identificacion), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/cambio/referenciaComerciante")
    @ApiOperation(value = "Retorna datos de las Referencias de Comerciante del cliente para posteriormente actualizarlas", httpMethod = "GET")
    public ResponseEntity<ClienteDTO> findClienteToUpdateReferenciaComerciante(
        @MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
        @PathVariable("identificacion") String identificacion) {
        return new ResponseEntity<ClienteDTO>(clienteService.findClienteToUpdateReferenciaComerciante(tipoIdentificacion, identificacion), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/nombre", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio de nombre de un cliente", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updateNombre(@RequestBody ClienteDTO clienteDTO){
		return new ResponseEntity<ClienteDTO>(clienteService.updateNombre(clienteDTO, true), HttpStatus.OK);
	}

	@RequestMapping(value = "/{identificacion}/iden", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio de identificacion de un cliente", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updateId(@RequestBody ClienteDTO clienteDTO){
		return new ResponseEntity<ClienteDTO>(clienteService.updateId(clienteDTO, true), HttpStatus.OK);
	}

	@RequestMapping(value = "/{identificacion}/datosGenerales", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio de los datos generales de un cliente", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updateDatosGenerales(@RequestBody ClienteDTO clienteDTO) {
		return new ResponseEntity<ClienteDTO>(clienteService.updateDatosGenerales(clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/dependientes", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio de dependientes de un cliente individual", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updateDependientes(@RequestBody ClienteDTO clienteDTO) {
		return new ResponseEntity<ClienteDTO>(clienteService.updateDependientes(clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/perfilEconomico", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio del perfil económico de un cliente", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updatePerfilEconomico(@RequestBody ClienteDTO clienteDTO) {
		return new ResponseEntity<ClienteDTO>(clienteService.updatePerfilEconomico(clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/representanteLegal", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio del representante legal de un cliente", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updateRepresentanteLegal(@RequestBody ClienteDTO clienteDTO) {
		return new ResponseEntity<ClienteDTO>(clienteService.updateRepresentanteLegal(clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/datosAdicionales", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio de los datos adicionales de un cliente", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updateDatosAdicionales(@RequestBody ClienteDTO clienteDTO) {
		return new ResponseEntity<ClienteDTO>(clienteService.updateDatosAdicionales(clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/documentosPresentados", method = RequestMethod.PUT)
	@ApiOperation(value = "Permite el cambio de los documentos presentados de un cliente", httpMethod = "PUT")
	public ResponseEntity<ClienteDTO> updateDocumentosPresentados(@RequestBody ClienteDTO clienteDTO) {
		return new ResponseEntity<ClienteDTO>(clienteService.updateDocumentosPresentados(clienteDTO), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/{identificacion}/direcciones", method = RequestMethod.PUT)
    @ApiOperation(value = "Permite el cambio de las direcciones de un cliente", httpMethod = "PUT")
    public ResponseEntity<ClienteDTO> updateDirecciones(@RequestBody ClienteDTO clienteDTO){
        return new ResponseEntity<ClienteDTO>(clienteService.updateDirecciones(clienteDTO), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/referencias", method = RequestMethod.PUT)
    @ApiOperation(value = "Permite el cambio de las referencias de un cliente", httpMethod = "PUT")
    public ResponseEntity<ClienteDTO> updateReferencias(@RequestBody ClienteDTO clienteDTO){
        return new ResponseEntity<ClienteDTO>(clienteService.updateReferencias(clienteDTO), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/referenciasProveedores", method = RequestMethod.PUT)
    @ApiOperation(value = "Permite el cambio de las referencias del Proveedor de un cliente", httpMethod = "PUT")
    public ResponseEntity<ClienteDTO> updateReferenciaProveedor(@RequestBody ClienteDTO clienteDTO){
        return new ResponseEntity<ClienteDTO>(clienteService.updateReferenciaProveedor(clienteDTO), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/referenciasLaborales", method = RequestMethod.PUT)
    @ApiOperation(value = "Permite el cambio de las referencias Laborales de un cliente", httpMethod = "PUT")
    public ResponseEntity<ClienteDTO> updateReferenciasLaborales(@RequestBody ClienteDTO clienteDTO){
        return new ResponseEntity<ClienteDTO>(clienteService.updateReferenciasLaborales(clienteDTO), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/referenciasComerciante", method = RequestMethod.PUT)
    @ApiOperation(value = "Permite el cambio de las referencias Comerciante Empleados de un cliente", httpMethod = "PUT")
    public ResponseEntity<ClienteDTO> updateReferenciaComerciante(@RequestBody ClienteDTO clienteDTO){
        return new ResponseEntity<ClienteDTO>(clienteService.updateReferenciasComerciante(clienteDTO), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/cambioHuellaFoto", method = RequestMethod.POST)
    @ApiOperation(value = "Permite buscar el cliente para actualizar Huella o Fotografia", httpMethod = "POST")
    public ResponseEntity<Boolean> updateHuellaFoto(
        @RequestParam(value = "tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion,
        @RequestParam(value = "identificacion") String identificacion,
        @RequestParam(value = "nombre", defaultValue = " ", required = false) String nombre,
        @RequestParam(value = "tipo") String tipo,
        HttpServletRequest request) {
        return new ResponseEntity<Boolean>(clienteService.updateHuellaFoto(request.getRemoteAddr(), tipoIdentificacion, identificacion, nombre, tipo), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/seccionesPendientes", method = RequestMethod.GET)
    @ApiOperation(value = "Permite identificar secciones que estan incompletas", httpMethod = "GET")
    public ResponseEntity<CambioSituacionEconomicaSeccion> findDirtySection(
    	@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
    	@PathVariable("identificacion") String identificacion){
        return new ResponseEntity<CambioSituacionEconomicaSeccion>(clienteService.findDirtySection(tipoIdentificacion, identificacion), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/{identificacion}/resumenSeccionesPendientes", method = RequestMethod.GET)
    @ApiOperation(value = "Permite identificar secciones que están incompletas", httpMethod = "GET")
    public ResponseEntity<ClienteSeccionPendiente> findSeccionesPendientesByCliente(
    	@MatrixVariable(value="tipoIdentificacion", defaultValue = " ", required = false) String tipoIdentificacion, 
    	@PathVariable("identificacion") String identificacion){
        return new ResponseEntity<ClienteSeccionPendiente>(clienteService.findSeccionesPendientesByCliente(tipoIdentificacion, identificacion), HttpStatus.OK);
    }
	
}
