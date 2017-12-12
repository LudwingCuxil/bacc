package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.repository.CrudRepository;

import com.bytesw.platform.eis.bo.plataforma.IntentoFallido;
import com.bytesw.platform.eis.bo.plataforma.identifier.IntentoFallidoId;

public interface IntentoFallidoRepository extends CrudRepository<IntentoFallido, IntentoFallidoId> {

	public IntentoFallido findById(IntentoFallidoId id);
	
}