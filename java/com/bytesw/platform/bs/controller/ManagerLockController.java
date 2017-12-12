package com.bytesw.platform.bs.controller;

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

import com.bytesw.platform.bs.service.ManagerLockService;
import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;
import com.bytesw.platform.eis.bo.plataforma.PessimisticLock;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "ManagerLock")
public class ManagerLockController {
	
	protected Logger logger = Logger.getLogger(getClass().getName());
	
	private ManagerLockService managerLockService;
	
	@Autowired
	public ManagerLockController(ManagerLockService managerLockService) {
		this.managerLockService = managerLockService;
	}
	
	@RequestMapping(value = "/acquireLock", method = RequestMethod.POST)
	@ApiOperation(value = "Bloqueo de un cliente por identificador", httpMethod = "POST")
	public ResponseEntity<PessimisticLock> acquireLock(@RequestBody ClienteId id) {
		return new ResponseEntity<PessimisticLock>(managerLockService.acquireLock(id), HttpStatus.OK);
	}
	
	@RequestMapping(value = "/cancelLock", method = RequestMethod.POST)
	@ApiOperation(value = "Cancela el bloqueo de un cliente por identificador", httpMethod = "POST")
	public ResponseEntity<Void> cancelLock(@RequestBody ClienteId id) {
		managerLockService.cancelLock(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
	
	@ApiOperation(value = "Elimina todos los registros bloqueados por el usuario", httpMethod = "DELETE")
	@RequestMapping(value = "/deleteAllLock", method = RequestMethod.DELETE)
	public ResponseEntity<Void> deleteAllLock() {
		managerLockService.deleteAllLock();
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
	
}