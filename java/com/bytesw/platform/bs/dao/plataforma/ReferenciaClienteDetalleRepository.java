package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.plataforma.ReferenciaClienteDetalle;

public interface ReferenciaClienteDetalleRepository extends PagingAndSortingRepository<ReferenciaClienteDetalle, Integer>, JpaSpecificationExecutor<ReferenciaClienteDetalle> {

	@Query(value = "FROM ReferenciaClienteDetalle rcd WHERE rcd.uso = :uso ORDER BY rcd.orden ASC")
	public Iterable<ReferenciaClienteDetalle> findReferenciaClienteDetalleByUso(@Param("uso") String uso);
	
	@Query(value = "FROM ReferenciaClienteDetalle rcd WHERE rcd.uso = :uso AND rcd.referencia.tipoReferencia = :tipoReferencia ORDER BY rcd.referencia.tipoReferencia ASC")
    public Iterable<ReferenciaClienteDetalle> findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(@Param("uso") String uso, @Param("tipoReferencia") String tipoReferencia);
	
	@Query(value = "FROM ReferenciaClienteDetalle rcd WHERE rcd.referencia.tipoReferencia = :tipoReferencia AND rcd.uso = :uso")
    public ReferenciaClienteDetalle findReferenciaClienteDetalleByReferenciaTipoReferenciaAndUso(@Param("tipoReferencia") String tipoReferencia, @Param("uso") String uso);

	@Query(value = "FROM ReferenciaClienteDetalle rcd WHERE rcd.referencia.id = :id")
	public Iterable<ReferenciaClienteDetalle> findReferenciaClienteDetalleByReferenciaClienteId(@Param("id") Integer id);

	public <S extends ReferenciaClienteDetalle> Iterable<S> findAll(Example<S> example, Pageable page);

	public Page<ReferenciaClienteDetalle> findAll(Specification<ReferenciaClienteDetalle> example, Pageable page);
	
}
