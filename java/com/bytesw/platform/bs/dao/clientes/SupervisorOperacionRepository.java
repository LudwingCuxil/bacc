package com.bytesw.platform.bs.dao.clientes;

import org.springframework.data.repository.CrudRepository;

import com.bytesw.platform.eis.bo.clientes.SupervisorOperacion;
import com.bytesw.platform.eis.bo.clientes.identifier.SupervisorOperacionId;

public interface SupervisorOperacionRepository extends CrudRepository<SupervisorOperacion, SupervisorOperacionId> {
	
}