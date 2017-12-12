package com.bytesw.platform.bs.dao.core;

import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.bytesw.platform.eis.bo.core.Rol;

import java.util.List;

public interface RolRepository extends PagingAndSortingRepository<Rol, Integer>, JpaSpecificationExecutor<Rol> {
  
    public <S extends Rol> Iterable<S> findAll(Example<S> example, Pageable page);
  
    public Page<Rol> findAll(Specification<Rol> example, Pageable page);

    @Query(value = "FROM Rol r WHERE r.tipo = 'MOD' AND r.padre = 0 ORDER BY r.nombre")
    public List<Rol> findParents();
;
}
