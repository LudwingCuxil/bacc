package com.bytesw.platform.bs.dao.core;

import org.springframework.data.repository.CrudRepository;

import com.bytesw.platform.eis.bo.core.PartialWebForm;;

public interface PartialPersistRepository extends CrudRepository<PartialWebForm, Integer> {

	public PartialWebForm findByUsernameAndWebformName(String username, String webformName);
	
	public Long countByUsernameAndWebformName(String username, String webformName);
	
}
