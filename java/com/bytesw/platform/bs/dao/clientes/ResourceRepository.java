package com.bytesw.platform.bs.dao.clientes;

import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.eis.bo.clientes.Foto;
import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;

public interface ResourceRepository extends CrudRepository<Foto, ClienteId> {
	
	@Transactional
	public Foto findById(ClienteId id);
	
}