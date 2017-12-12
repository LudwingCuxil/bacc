package com.bytesw.platform.bs.dao.core;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.bytesw.platform.eis.bo.core.Usuario;

public interface UsuarioRepository extends PagingAndSortingRepository<Usuario, Integer>, JpaSpecificationExecutor<Usuario> {

	public Usuario findByUsername(String username);
	
}
