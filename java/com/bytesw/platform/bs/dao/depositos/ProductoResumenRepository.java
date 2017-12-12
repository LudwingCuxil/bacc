package com.bytesw.platform.bs.dao.depositos;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.depositos.ProductoResumen;
import com.bytesw.platform.eis.bo.depositos.identifier.ProductoId;

public interface ProductoResumenRepository extends Repository<ProductoResumen, ProductoId> {

	@Query(value = "FROM ProductoResumen p WHERE p.moneda = CASE WHEN :moneda = '$NULL' THEN p.moneda ELSE :moneda END AND p.tipoProducto = CASE WHEN :tipoProducto = 0 THEN p.tipoProducto ELSE :tipoProducto END ORDER BY p.descripcion")
	public Iterable<ProductoResumen> findProductoResumenByMonedaAndTipoProducto(@Param("moneda") String moneda, @Param("tipoProducto") Integer tipoProducto);
	
	public ProductoResumen findProductoResumenById(ProductoId id);
	
}