/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bytesw.platform.commons;

/**
 *
 * @author oscar
 */
public class ValorDTO {

    private String valor;
    private String descripcion;
    
    public ValorDTO() {
        super();
    }

    public ValorDTO(String valor, String descripcion) {
        super();
        this.valor = valor;
        this.descripcion = descripcion;
    }

    public String getValor() {
        return valor;
    }
    public void setValor(String valor) {
        this.valor = valor;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

}
