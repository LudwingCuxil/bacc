package com.bytesw.platform.bs.dao.depositos;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.depositos.CuentaResumen;
import com.bytesw.platform.eis.bo.depositos.PersonaMancomunada;
import com.bytesw.platform.eis.bo.depositos.identifier.PersonaMancomunadaId;

public interface PersonaMancomunadaRepository extends Repository<PersonaMancomunada, PersonaMancomunadaId> {

	@Query(value = "SELECT c FROM CuentaResumen c, PersonaMancomunada pm WHERE c.id = pm.id.cuenta AND pm.id.cliente.id.tipoIdentificacion = :td AND pm.id.cliente.id.identificacion = :d AND c.tipoProducto NOT IN :tps AND c.estado IN :eds AND c.moneda IN :mns")
	public List<CuentaResumen> findCuentasCoPropietario(@Param("td") String td, @Param("d") String d, @Param("tps") List<Integer> tps, @Param("eds") List<String> eds, @Param("mns") List<String> mns);
	
}