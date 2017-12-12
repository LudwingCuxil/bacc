package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.plataforma.CampoProducto;

public interface CampoProductoRepository extends PagingAndSortingRepository<CampoProducto, Integer>, JpaSpecificationExecutor<CampoProducto> {

	@Query(value = "FROM CampoProducto cp WHERE cp.producto = :producto AND cp.subProducto = :subProducto AND cp.campo.codigo = :campo")
	public CampoProducto findCampoProductoByProductoAndSubProducto(@Param("producto") Integer producto, @Param("subProducto") Integer subProducto, @Param("campo") String campo);
	
}
