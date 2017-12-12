package com.bytesw.platform.bs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.service.security.RolService;
import com.bytesw.platform.eis.bo.core.Rol;
import com.bytesw.platform.eis.dto.SearchDTO;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping(value = "/api/roles", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Rol")
public class RolController {

    private RolService rolService;

    @Autowired
    public RolController(RolService rolService){
        this.rolService = rolService;
    }

    @RequestMapping(value = "findAll", method = RequestMethod.POST)
    @ApiOperation(value = "Retorna listado de clientes", httpMethod = "POST")
    public ResponseEntity<Iterable<Rol>> findAll(Pageable page, @RequestBody SearchDTO request) {
        if(request == null || request.getListParameter() == null || request.getListParameter().size() == 0) {
            return new ResponseEntity<Iterable<Rol>>(rolService.findAll(page), HttpStatus.OK);
        }
        return new ResponseEntity<Iterable<Rol>>(rolService.findAll(request, page), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Iterable<Rol>> find(Pageable page) {
        return new ResponseEntity<Iterable<Rol>>(rolService.findAll(page), HttpStatus.OK);
    }

    @RequestMapping(value = "/findAllByIds" , method = RequestMethod.POST)
    public ResponseEntity<Iterable<Rol>> findAllByIds(@RequestBody Iterable<Integer> request) {
        return new ResponseEntity<Iterable<Rol>>(rolService.findAllByIds(request), HttpStatus.OK);
    }

    @RequestMapping(value = "/parents" , method = RequestMethod.GET)
    public ResponseEntity<List<Rol>> findParents() {
        return new ResponseEntity<List<Rol>>(rolService.findParents(), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Rol> findByIdRol(@PathVariable("id") Integer id) {
        return new ResponseEntity<Rol>(rolService.findById(id), HttpStatus.OK);
    }
  
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Rol> createRol(@RequestBody com.bytesw.platform.eis.bo.core.Rol rol) {
        return new ResponseEntity<Rol>(rolService.create(rol), HttpStatus.OK);
    }
  
    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Rol> updateRol(@RequestBody com.bytesw.platform.eis.bo.core.Rol rol) {
        return new ResponseEntity<Rol>(rolService.update(rol), HttpStatus.OK);
    }
  
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteRol(@PathVariable("id") Integer id) {
        rolService.delete(id);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }
  
}
