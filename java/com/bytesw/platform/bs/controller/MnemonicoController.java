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

import com.bytesw.platform.bs.service.MnemonicoService;
import com.bytesw.platform.eis.bo.clientes.ParametroGeneral;
import com.bytesw.platform.eis.bo.clientes.ParametroHuellaFoto;
import com.bytesw.platform.eis.bo.clientes.ParametroPais;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.plataforma.ListaValorAdicional;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.bo.plataforma.ParametroDetalle;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Mnemonico")
public class MnemonicoController {

	protected Logger logger = Logger.getLogger(getClass().getName());
	
	private MnemonicoService mnemonicoService;
	
	@Autowired
	public MnemonicoController(MnemonicoService mnemonicoService) {
		this.mnemonicoService = mnemonicoService;
	}
	
	@RequestMapping(value = "/parametrosPlataforma/{codigo}")
	@ApiOperation(value = "recupera un parámetro especifico de la plataforma", httpMethod = "GET")
	public ResponseEntity<Parametro> findParametroPlataforma(@PathVariable("codigo") String codigo){
		return new ResponseEntity<Parametro>(mnemonicoService.findParametroPlataforma(codigo), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/parametrosPlataforma/{codigo}/valores")
	@ApiOperation(value = "recupera los valores de un parámetro especifico de la plataforma", httpMethod = "GET")
	public ResponseEntity<Iterable<ParametroDetalle>> findParametroValoresPlataforma(@PathVariable("codigo") String codigo){
		return new ResponseEntity<Iterable<ParametroDetalle>>(mnemonicoService.findParametroPlataformaDetalles(codigo), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/parametrosGenerales/")
	@ApiOperation(value = "recupera los parámetros generales del módulo de clientes", httpMethod = "GET")
	public ResponseEntity<ParametroGeneral> findParametroGeneral() {
		return new ResponseEntity<ParametroGeneral>(mnemonicoService.findParametroGeneral(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/parametrosPais/{empresa}")
	@ApiOperation(value = "recupera los parámetros del módulo de clientes", httpMethod = "GET")
	public ResponseEntity<ParametroPais> findParametroPais(@PathVariable("empresa") String empresa) {
		return new ResponseEntity<ParametroPais>(mnemonicoService.findParametroPais(empresa), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/parametrosHuellaFoto/{empresa}")
	@ApiOperation(value = "recupera los parámetros para configurar huella y foto", httpMethod = "GET")
	public ResponseEntity<ParametroHuellaFoto> findParametroHuellaFoto(
		@PathVariable("empresa") String empresa,
		@RequestParam(value = "tipoPersona") TipoPersona tipoPersona) {
		return new ResponseEntity<ParametroHuellaFoto>(mnemonicoService.findParametroHuellaFoto(empresa, tipoPersona), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/parametrosPlataforma/listas")
	@ApiOperation(value = "recupera lista de valores adicionales definidos en PLLVCA", httpMethod = "GET")
	public ResponseEntity<Iterable<ListaValorAdicional>> findListaValorAdicional(
		@RequestParam("codigoEntidad") String codigoEntidad, 
		@RequestParam("lista") String lista) {
	    return new ResponseEntity<Iterable<ListaValorAdicional>>(mnemonicoService.findListaValorAdicional(codigoEntidad, lista), HttpStatus.OK);
	}
	
}
