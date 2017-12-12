package com.bytesw.platform.bs.controller;

import io.swagger.annotations.Api;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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
import com.bytesw.platform.bs.service.security.UserService;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.dto.SearchDTO;

import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api/usuario", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "User")
public class UsuarioController {

    private UserService userService;

    @Autowired
    public UsuarioController(UserService userService){
        this.userService = userService;
    }

    @RequestMapping(value = "findAll", method = RequestMethod.POST)
    @ApiOperation(value = "Retorna listado de clientes", httpMethod = "POST")
    public ResponseEntity<Iterable<Usuario>> findAll(Pageable page, @RequestBody SearchDTO request) {
        if (request == null || request.getListParameter() == null || request.getListParameter().size() == 0) {
            return new ResponseEntity<Iterable<Usuario>>(userService.findAll(page), HttpStatus.OK);
        }
        return new ResponseEntity<Iterable<Usuario>>(userService.findAll(request, page), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Iterable<Usuario>> find(Pageable page) {
        return new ResponseEntity<Iterable<Usuario>>(userService.findAll(page), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Usuario> findByIdUsuario(@PathVariable("id") Integer id) {
        return new ResponseEntity<Usuario>(userService.findById(id), HttpStatus.OK);
    }

    @RequestMapping(value = "/informacion", method = RequestMethod.GET)
    @ApiOperation(value = "Retorna el usuario autenticado", httpMethod = "GET")
    public ResponseEntity<Usuario> findUserAuthenticated() {
        return new ResponseEntity<Usuario>(userService.findUser(), HttpStatus.OK);
    }
  
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Usuario> createUser(@RequestBody com.bytesw.platform.eis.bo.core.Usuario user) {
        return new ResponseEntity<Usuario>(userService.create(user), HttpStatus.OK);
    }
  
    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Usuario> updateUser(@RequestBody com.bytesw.platform.eis.bo.core.Usuario user) {
        return new ResponseEntity<Usuario>(userService.update(user), HttpStatus.OK);
    }
  
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Integer id) {
        userService.delete(id);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
