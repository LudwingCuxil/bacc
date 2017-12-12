package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.plataforma.ListaValorAdicional;
import com.bytesw.platform.eis.bo.plataforma.identifier.CampoAdicionalId;
import com.bytesw.platform.eis.bo.plataforma.identifier.ListaValorAdicionalId;

public interface ListaValorAdicionalRepository extends Repository<ListaValorAdicional, ListaValorAdicionalId> {

	@Query(value = "FROM ListaValorAdicional lva WHERE id.campo = :campoAdicionalId ORDER BY id.codigo")
	public Iterable<ListaValorAdicional> findListaValorAdicionalByCampoAdicionalId(@Param("campoAdicionalId") CampoAdicionalId campoAdicionalId);
	
}