package com.bytesw.platform.bs.dao.plataforma;

import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.bytesw.platform.eis.bo.plataforma.ReferenciaCliente;

public interface ReferenciaClienteRepository extends PagingAndSortingRepository<ReferenciaCliente, Integer>, JpaSpecificationExecutor<ReferenciaCliente> {

    public <S extends ReferenciaCliente> Iterable<S> findAll(Example<S> example, Pageable page);

    public Page<ReferenciaCliente> findAll(Specification<ReferenciaCliente> example, Pageable page);

}
