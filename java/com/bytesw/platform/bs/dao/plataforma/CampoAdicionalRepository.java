package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.repository.CrudRepository;

import com.bytesw.platform.eis.bo.plataforma.CampoAdicional;
import com.bytesw.platform.eis.bo.plataforma.identifier.CampoAdicionalId;

public interface CampoAdicionalRepository extends CrudRepository<CampoAdicional, CampoAdicionalId> {

	public CampoAdicional findById(CampoAdicionalId id);
	
}