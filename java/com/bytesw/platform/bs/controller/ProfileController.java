package com.bytesw.platform.bs.controller;

import java.util.Set;
import java.util.logging.Logger;

import io.swagger.annotations.Api;
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

import com.bytesw.platform.bs.service.security.ProfileService;
import com.bytesw.platform.eis.bo.core.Perfil;
import com.bytesw.platform.eis.bo.core.Rol;
import com.bytesw.platform.eis.dto.SearchDTO;

import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api/profiles", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Profile")
public class ProfileController {

    private ProfileService profileService;

    @Autowired
    public ProfileController(ProfileService profileService){
        this.profileService = profileService;
    }
    
    @RequestMapping()
    public Iterable<Perfil> getAll(Pageable page) {
        return profileService.findAll(page);
    }
  
    @RequestMapping(value = "/{id}")
    public Perfil getById(@PathVariable("id") Integer id) {
        return profileService.findById(id);
    }

    @RequestMapping(value = "findAll", method = RequestMethod.POST)
    @ApiOperation(value = "Retorna listado de clientes", httpMethod = "POST")
    public ResponseEntity<Iterable<Perfil>> findAll(Pageable page, @RequestBody SearchDTO request) {
        if(request == null || request.getListParameter() == null || request.getListParameter().size() == 0) {
            return new ResponseEntity<Iterable<Perfil>>(profileService.findAll(page), HttpStatus.OK);
        }
        return new ResponseEntity<Iterable<Perfil>>(profileService.findAll(request, page), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Perfil> createProfile(@RequestBody Perfil perfil) {
        return new ResponseEntity<Perfil>(profileService.create(perfil), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Perfil> updateProfile(@RequestBody Perfil perfil) {
      return new ResponseEntity<Perfil>(profileService.update(perfil), HttpStatus.OK);
  }	
  
    @RequestMapping(value = "/{id}/roles", method = RequestMethod.PUT)
    public Perfil updateRoles(@PathVariable("id") Integer id, @RequestBody Set<Integer> roles) {
        return profileService.addRoles(id, roles);
    }
  
    @RequestMapping(value = "/{id}/deleteRoles", method = RequestMethod.POST)
    public Perfil deleteRoles(@PathVariable("id") Integer id, @RequestBody Set<Integer> roles) {
        return profileService.removeRoles(id, roles);
    }
  
    @RequestMapping(value = "/findRolByPerfilId/{id}", method = RequestMethod.GET)
    public ResponseEntity<Iterable<Rol>> findCampoCanalByCampoId(@PathVariable("id") Integer id) {
        return new ResponseEntity<Iterable<Rol>>(this.profileService.findById(id).getRoles(), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        profileService.delete(id);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }
  
}
