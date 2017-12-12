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
import com.bytesw.platform.eis.bo.depositos.ParametroGenerico;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.bo.plataforma.ParametroDetalle;
import java.util.ArrayList;
import java.util.List;



public class MnemonicoDTO {

	public String codigo;
	public String valor;
	public List<ValorDTO> valores;
	
	public MnemonicoDTO() {
		super();
	}
	
	public MnemonicoDTO(Parametro bo) {
		super();
		this.codigo = bo.getCodigo();
		this.valor = bo.getValor();
		if (null != bo.getValores() && !bo.getValores().isEmpty()) {
			this.valores = new ArrayList<ValorDTO>();
			for (ParametroDetalle pd : bo.getValores()){
				this.valores.add(new ValorDTO(pd.getValor(), pd.getDescripcion()));
			}
		}
	}
	
	public MnemonicoDTO(ParametroGenerico bo) {
		super();
		this.codigo = bo.getCodigo();
		this.valor = null != bo.getValor() ? bo.getValor().trim() : null;
	}

	public String getCodigo() {
		return codigo;
	}
	public void setCodigo(String codigo) {
		this.codigo = codigo;
	}
	public String getValor() {
		return valor;
	}
	public void setValor(String valor) {
		this.valor = valor;
	}
	public List<ValorDTO> getValores() {
		return valores;
	}
	public void setValores(List<ValorDTO> valores) {
		this.valores = valores;
	}

}

