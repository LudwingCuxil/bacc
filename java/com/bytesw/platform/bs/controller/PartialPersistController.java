package com.bytesw.platform.bs.controller;

import java.util.logging.Logger;

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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.bytesw.platform.bs.service.PartialPersistService;
import com.bytesw.platform.eis.bo.core.PartialWebForm;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "PartialPersist")
public class PartialPersistController {
	
	protected Logger logger = Logger.getLogger(getClass().getName());
	
	private PartialPersistService partialPersistService;
	
	@Autowired
	public PartialPersistController(PartialPersistService partialPersistService) {
		this.partialPersistService = partialPersistService;
	}
	
	@RequestMapping(value = "/webform/{name}", method = RequestMethod.GET)
	@ApiOperation(value = "Recupera información parcial a partir del nombre del formulario", httpMethod = "GET")
    public ResponseEntity<PartialWebForm> findByName(@PathVariable("name") String name) {
		return new ResponseEntity<PartialWebForm>(partialPersistService.findByWebformName(name), HttpStatus.OK);
    }
	
	@RequestMapping(value = "/webform/", method = RequestMethod.POST)
	@ApiOperation(value = "Graba o actualiza información parcial del formulario", httpMethod = "POST")
	public ResponseEntity<PartialWebForm> saveOrUpdate(@RequestBody PartialWebForm bo, UriComponentsBuilder builder) {
		bo = partialPersistService.saveOrUpdate(bo);
		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(builder.path("/webform/{name}").buildAndExpand(bo.getWebformName()).toUri());
		return new ResponseEntity<PartialWebForm>(bo, headers, HttpStatus.CREATED);
	}
	
	@ApiOperation(value = "Elimina información parcial a partir del nombre del formulario", httpMethod = "DELETE")
	@RequestMapping(value = "/webform/{name}", method = RequestMethod.DELETE)
	public ResponseEntity<Void> delete(@PathVariable("name") String name) {
		partialPersistService.delete(name);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}

}