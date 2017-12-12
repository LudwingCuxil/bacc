package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.repository.CrudRepository;

import com.bytesw.platform.eis.bo.plataforma.ValorAdicional;
import com.bytesw.platform.eis.bo.plataforma.identifier.ValorAdicionalId;

public interface ValorAdicionalRepository extends CrudRepository<ValorAdicional, ValorAdicionalId> {

	public ValorAdicional findById(ValorAdicionalId id);
	
}