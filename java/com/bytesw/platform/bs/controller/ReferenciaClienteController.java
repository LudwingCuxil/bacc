package com.bytesw.platform.bs.controller;

import com.bytesw.platform.bs.service.plataforma.ReferenciaClienteDetalleService;
import com.bytesw.platform.bs.service.plataforma.ReferenciaClienteService;
import com.bytesw.platform.eis.bo.plataforma.ReferenciaClienteDetalle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.bytesw.platform.eis.bo.plataforma.ReferenciaCliente;
import com.bytesw.platform.eis.dto.SearchDTO;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@CrossOrigin
@RequestMapping(value = "/api/referenciasCliente", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Referencia Cliente")
public class ReferenciaClienteController {

    private ReferenciaClienteService referenciaClienteService;
    private ReferenciaClienteDetalleService referenciaClienteDetalleService;

    @Autowired
    public ReferenciaClienteController(ReferenciaClienteService referenciaClienteServiceService, ReferenciaClienteDetalleService referenciaClienteDetalleService){
        this.referenciaClienteService = referenciaClienteServiceService;
        this.referenciaClienteDetalleService = referenciaClienteDetalleService;
    }

    @RequestMapping(value = "findAll", method = RequestMethod.POST)
    @ApiOperation(value = "Retorna listado de referencias", httpMethod = "POST")
    public ResponseEntity<Iterable<ReferenciaCliente>> findAll(Pageable page, @RequestBody SearchDTO request) {
        if(request == null || request.getListParameter() == null || request.getListParameter().size() == 0) {
            return new ResponseEntity<Iterable<ReferenciaCliente>>(referenciaClienteService.findAll(page), HttpStatus.OK);
        }
        return new ResponseEntity<Iterable<ReferenciaCliente>>(referenciaClienteService.findAll(request, page), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Iterable<ReferenciaCliente>> find(Pageable page) {
        return new ResponseEntity<Iterable<ReferenciaCliente>>(referenciaClienteService.findAll(page), HttpStatus.OK);
    }

    @RequestMapping(value = "/findAllByIds" , method = RequestMethod.POST)
    public ResponseEntity<Iterable<ReferenciaCliente>> findAllByIds(@RequestBody Iterable<Integer> request) {
        return new ResponseEntity<Iterable<ReferenciaCliente>>(referenciaClienteService.findAllByIds(request), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<ReferenciaCliente> findByIdReferenciaCliente(@PathVariable("id") Integer id) {
        return new ResponseEntity<ReferenciaCliente>(referenciaClienteService.findById(id), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}/detalles", method = RequestMethod.GET)
    public ResponseEntity<Iterable<ReferenciaClienteDetalle>> findReferenciaClienteDetalleByReferenciaClienteId(@PathVariable("id") Integer id) {
        return new ResponseEntity<Iterable<ReferenciaClienteDetalle>>(referenciaClienteDetalleService.findByReferenciaClienteId(id), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<ReferenciaCliente> createReferenciaCliente(@RequestBody com.bytesw.platform.eis.bo.plataforma.ReferenciaCliente referenciaCliente) {
        return new ResponseEntity<ReferenciaCliente>(referenciaClienteService.create(referenciaCliente), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<ReferenciaCliente> updateReferenciaCliente(@RequestBody com.bytesw.platform.eis.bo.plataforma.ReferenciaCliente referenciaCliente) {
        return new ResponseEntity<ReferenciaCliente>(referenciaClienteService.update(referenciaCliente), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteReferenciaCliente(@PathVariable("id") Integer id) {
        referenciaClienteService.delete(id);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}