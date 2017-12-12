package com.bytesw.platform.bs.dao.core;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.eis.bo.core.Perfil;

public interface PerfilRepository extends PagingAndSortingRepository<Perfil, Integer>, JpaSpecificationExecutor<Perfil> {

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM STANDARD.STD_ROLES_PERFIL WHERE ROL_ID = ?1", nativeQuery = true)
    void deleteProfileRolByRol(Integer rol);
  
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM STANDARD.STD_ROLES_PERFIL WHERE ROL_ID = :rol AND PERFIL_ID = :perfil", nativeQuery = true)
    void deleteRolProfileBy(@Param("rol") Integer rol,  @Param("perfil") Integer profile);

    Long countByRoles(Integer id);

    @Transactional(readOnly = true)
    public Page<Perfil> findAll(Specification<Perfil> example, Pageable page);

    @Transactional(readOnly = true)
    public Long countById(Integer id);
  
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO STANDARD.STD_ROLES_PERFIL(ROL_ID, PERFIL_ID) VALUES(:rol, :perfil)", nativeQuery = true)
    void saveRolPerfil(@Param("rol") Integer rol, @Param("perfil") Integer perfil);

    public Perfil findByNombre(String nombre);
}

