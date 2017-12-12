package com.bytesw.platform.bs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.plataforma.FormularioProductoRepository;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.plataforma.FormularioProducto;

@Service
public class FormularioProductoService {

	private FormularioProductoRepository formularioProductoRespository;
	
	@Autowired
	public FormularioProductoService(FormularioProductoRepository formularioProductoRespository) {
		this.formularioProductoRespository = formularioProductoRespository;
	}
	
	@Transactional(readOnly = true)
	public List<FormularioProducto> findByTipoPersonaAndProductoAndFormulario(TipoPersona tipoPersona, Integer producto, Integer formulario){
		return formularioProductoRespository.findByTipoPersonaAndProductoAndFormulario(tipoPersona, producto, formulario);
	}
	
}
