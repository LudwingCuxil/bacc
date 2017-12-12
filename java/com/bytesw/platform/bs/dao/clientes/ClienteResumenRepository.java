package com.bytesw.platform.bs.dao.clientes;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import com.bytesw.platform.eis.bo.clientes.ClienteResumen;
import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;

public interface ClienteResumenRepository extends PagingAndSortingRepository<ClienteResumen, ClienteId>, JpaSpecificationExecutor<ClienteResumen> {

	public Page<ClienteResumen> findAll(Specification<ClienteResumen> example, Pageable page);
	
	public ClienteResumen findById(ClienteId id);
	
	public boolean existsByTipoDeIdentificacionAndNumeroIdentificacion(String tipoDeIdentificacion, String numeroIdentificacion);
	
	public boolean existsByNombre(String nombre);
	
	@Query(value = "SELECT count(*) FROM ClienteResumen c WHERE c.nombre = :nombre AND c.id != :id)")
	public Long countByNombreAndDoNotBeIdentifier(@Param("nombre") String nombre, @Param("id") ClienteId id);
	
}
