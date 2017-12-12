package com.bytesw.platform.eis.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;

public class ClienteResumenMapper implements RowMapper<ClienteResumenDTO> {

	public ClienteResumenDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
		ClienteResumenDTO cliente = new ClienteResumenDTO();
		cliente.setTipoIdentificacion(rs.getString("tipoIdentificacion"));
		cliente.setIdentificacion(rs.getString("identificacion"));
		cliente.setTipoDeIdentificacion(rs.getString("tipoDeIdentificacion"));
		cliente.setNumeroIdentificacion(rs.getString("numeroIdentificacion"));
		cliente.setNombre(rs.getString("nombre"));
		cliente.setRelacion(rs.getString("relacion"));
		return cliente;
	}
}
