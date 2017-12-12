package com.bytesw.platform.bs.controller;

import com.bytesw.platform.bs.service.plataforma.ReferenciaClienteDetalleService;
import com.bytesw.platform.eis.bo.plataforma.ReferenciaClienteDetalle;
import com.bytesw.platform.eis.dto.SearchDTO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping(value = "/api/referenciasClienteDetalle", produces = MediaType.APPLICATION_JSON_VALUE)
@Api(value = "Referencia Cliente Detalle")
public class ReferenciaClienteDetalleController {

    private ReferenciaClienteDetalleService referenciaClienteDetalleService;

    @Autowired
    public ReferenciaClienteDetalleController(ReferenciaClienteDetalleService referenciaClienteDetalleServiceService){
        this.referenciaClienteDetalleService = referenciaClienteDetalleServiceService;
    }

    @RequestMapping(value = "findAll", method = RequestMethod.POST)
    @ApiOperation(value = "Retorna listado de referencias", httpMethod = "POST")
    public ResponseEntity<Iterable<ReferenciaClienteDetalle>> findAll(Pageable page, @RequestBody SearchDTO request) {
        if(request == null || request.getListParameter() == null || request.getListParameter().size() == 0) {
            return new ResponseEntity<Iterable<ReferenciaClienteDetalle>>(referenciaClienteDetalleService.findAll(page), HttpStatus.OK);
        }
        return new ResponseEntity<Iterable<ReferenciaClienteDetalle>>(referenciaClienteDetalleService.findAll(request, page), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Iterable<ReferenciaClienteDetalle>> find(Pageable page) {
        return new ResponseEntity<Iterable<ReferenciaClienteDetalle>>(referenciaClienteDetalleService.findAll(page), HttpStatus.OK);
    }

    @RequestMapping(value = "/findAllByIds" , method = RequestMethod.POST)
    public ResponseEntity<Iterable<ReferenciaClienteDetalle>> findAllByIds(@RequestBody Iterable<Integer> request) {
        return new ResponseEntity<Iterable<ReferenciaClienteDetalle>>(referenciaClienteDetalleService.findAllByIds(request), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<ReferenciaClienteDetalle> findByIdReferenciaCliente(@PathVariable("id") Integer id) {
        return new ResponseEntity<ReferenciaClienteDetalle>(referenciaClienteDetalleService.findById(id), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<ReferenciaClienteDetalle> createReferenciaCliente(@RequestBody ReferenciaClienteDetalle referenciaClienteDetalle) {
        return new ResponseEntity<ReferenciaClienteDetalle>(referenciaClienteDetalleService.create(referenciaClienteDetalle), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<ReferenciaClienteDetalle> updateReferenciaCliente(@RequestBody ReferenciaClienteDetalle referenciaClienteDetalle) {
        return new ResponseEntity<ReferenciaClienteDetalle>(referenciaClienteDetalleService.update(referenciaClienteDetalle), HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteReferenciaClienteDetalle(@PathVariable("id") Integer id) {
        referenciaClienteDetalleService.delete(id);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
