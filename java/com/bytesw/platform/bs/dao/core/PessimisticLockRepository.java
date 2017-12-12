package com.bytesw.platform.bs.dao.core;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;
import com.bytesw.platform.eis.bo.plataforma.PessimisticLock;

public interface PessimisticLockRepository extends CrudRepository<PessimisticLock, ClienteId> {
	
	  @Modifying
	  @Query("DELETE FROM PessimisticLock WHERE id = :id AND owner = :owner")
	  public void cancelLock(@Param("id") ClienteId id, @Param("owner") String owner);
	  
	  @Modifying
	  @Query("DELETE FROM PessimisticLock WHERE owner = :owner")
	  public void deleteAllLock(@Param("owner") String owner);
	  
}
