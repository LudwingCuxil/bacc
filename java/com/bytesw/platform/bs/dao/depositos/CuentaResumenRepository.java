package com.bytesw.platform.bs.dao.depositos;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.depositos.CuentaResumen;
import com.bytesw.platform.eis.bo.depositos.identifier.CuentaId;

public interface CuentaResumenRepository extends Repository<CuentaResumen, CuentaId> {

	@Query(value = "FROM CuentaResumen c WHERE c.tipoDocumento = :td AND c.documento = :d AND c.tipoProducto NOT IN :tps AND c.estado IN :eds AND c.moneda IN :mns")
	public List<CuentaResumen> findCuentasTitular(@Param("td") String td, @Param("d") String d, @Param("tps") List<Integer> tps, @Param("eds") List<String> eds, @Param("mns") List<String> mns);
	
	@Query(value = "FROM CuentaResumen c WHERE c.tipoDocumentoTutor = :td AND c.documentoTutor = :d AND c.tipoProducto NOT IN :tps AND c.estado IN :eds AND c.moneda IN :mns")
	public List<CuentaResumen> findCuentasResponsable(@Param("td") String td, @Param("d") String d, @Param("tps") List<Integer> tps, @Param("eds") List<String> eds, @Param("mns") List<String> mns);
	
	public CuentaResumen findByNumeroCuenta(String numeroCuenta);
	
}