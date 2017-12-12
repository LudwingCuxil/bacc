package com.bytesw.platform.bs.dao.plataforma;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.plataforma.FormularioProducto;

public interface FormularioProductoRepository extends PagingAndSortingRepository<FormularioProducto, Integer>, JpaSpecificationExecutor<FormularioProducto> {

	public List<FormularioProducto> findByTipoPersonaAndProductoAndFormulario(TipoPersona tipoPersona, Integer producto, Integer formulario);
	
}