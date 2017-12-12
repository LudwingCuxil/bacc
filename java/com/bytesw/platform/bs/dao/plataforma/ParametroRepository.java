package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.plataforma.Parametro;

public interface ParametroRepository extends PagingAndSortingRepository<Parametro, Integer>, JpaSpecificationExecutor<Parametro> {

	@Query(value = "FROM Parametro p WHERE p.codigo = :codigo AND p.habilitado = true")
	public Parametro findParametroByCodigo(@Param("codigo") String codigo);
	
}