package com.bytesw.platform.bs.dao.plataforma;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.plataforma.ServicioElectronico;
import com.bytesw.platform.eis.bo.plataforma.dominio.Tipo;

public interface ServicioElectronicoRepository extends PagingAndSortingRepository<ServicioElectronico, Integer>, JpaSpecificationExecutor<ServicioElectronico> {

	@Query(value = "FROM ServicioElectronico WHERE tipoPersona = :tipoPersona OR tipoPersona = 'A' ORDER BY nombre ASC")
	public List<ServicioElectronico> findByTipoPersona(@Param("tipoPersona") Tipo tipoPersona);
	
}