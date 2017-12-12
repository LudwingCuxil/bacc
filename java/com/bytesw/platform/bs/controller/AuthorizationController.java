package com.bytesw.platform.bs.controller;

import java.math.BigDecimal;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.service.AuthorizationService;
import com.bytesw.platform.eis.dto.AuthorizationRequestDTO;
import com.bytesw.platform.eis.dto.AuthorizationResponseDTO;
import com.bytesw.platform.eis.dto.PermisoDTO;
import com.bytesw.platform.utilities.Consts;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Autorizaciones")
public class AuthorizationController {
	
	protected Logger logger = Logger.getLogger(getClass().getName());
	
	private AuthorizationService authorizationService;
	
	@Autowired
	public AuthorizationController(AuthorizationService authorizationService) {
		this.authorizationService = authorizationService;
	}

	@RequestMapping(value = "/autorizaciones/solicitar", method = RequestMethod.POST)
	@ApiOperation(value = "Envía la solicitud de autorización remota", httpMethod = "POST")
	public ResponseEntity<AuthorizationResponseDTO> solicitarAutorizacion(@RequestBody PermisoDTO permiso){
		AuthorizationResponseDTO response = new AuthorizationResponseDTO();
		if (permiso.getRequierePassword()) { 
			authorizationService.validatePassword(permiso);
		}
		AuthorizationRequestDTO req = new AuthorizationRequestDTO();
		req.setEmpresa(permiso.getEmpresa());
		req.setSupervisor(permiso.getSupervisor());
		req.setAgencia(permiso.getAgencia());
		req.setUsuario(permiso.getUsuario());
		req.setPermiso(permiso.getCodigo());
		req.setPrograma(Consts.PLAT);
		req.setEtiquetas(Consts.EMPTY);
		req.setDatos(Consts.EMPTY);
		req.setCodigoTransaccion(0);
		req.setReferencia(Consts.EMPTY);
		req.setTipoDato(Consts.EMPTY);
		req.setValor(BigDecimal.ZERO);
		req.setTasa(Consts.EMPTY);
		response = authorizationService.solicitarAutorizacionRemota(req);
		if (null != response) {
			if (response.getError().compareTo(1) == 0) {
				throw new ServiceAccessException(response.getDescripcion(), false);
			} else if (response.getError().compareTo(2) == 0) {
				response.setKey(req.getKey());
				response.setMessage(response.getDescripcion());
				response.setNotifica(true);
			}
		}
		return new ResponseEntity<AuthorizationResponseDTO>(response, HttpStatus.OK);
	}
	
	@RequestMapping(value = "/autorizaciones/revisar", method = RequestMethod.POST)
	@ApiOperation(value = "Revisa la autorización remota", httpMethod = "POST")
	public ResponseEntity<AuthorizationResponseDTO> revisarAutorizacion(@RequestBody AuthorizationResponseDTO req){
		AuthorizationResponseDTO response = authorizationService.revisarAutorizacionRemota(req);
		if (null != response && response.getError().compareTo(1) == 0) {
			throw new ServiceAccessException(response.getDescripcion(), false);
		}
		return new ResponseEntity<AuthorizationResponseDTO>(response, HttpStatus.OK);
	}
	
	@RequestMapping(value = "/autorizaciones/cancelar", method = RequestMethod.POST)
	@ApiOperation(value = "Cancela la autorización remota", httpMethod = "POST")
	public ResponseEntity<AuthorizationResponseDTO> cancelarAutorizacion(@RequestBody AuthorizationResponseDTO req){
		AuthorizationResponseDTO response = authorizationService.cancelarAutorizacionRemota(req);
		if (null != response && response.getError().compareTo(1) == 0) {
			throw new ServiceAccessException(response.getDescripcion(), false);
		}
		return new ResponseEntity<AuthorizationResponseDTO>(response, HttpStatus.OK);
	}

}
