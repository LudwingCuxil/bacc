package com.bytesw.platform.eis.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.bytesw.platform.eis.dto.depositos.CajeroDTO;

public class CajeroMapper implements RowMapper<CajeroDTO> {

	public CajeroDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
		CajeroDTO cajero = new CajeroDTO();
		cajero.setCodigo(rs.getInt("codigo"));
		cajero.setNombre(rs.getString("nombre"));
		cajero.setAgencia(rs.getInt("agencia"));
		cajero.setNombreAgencia(rs.getString("nombreAgencia"));
		cajero.setJornada(rs.getInt("jornada"));
		cajero.setTipoCajero(rs.getInt("tipoCajero"));
		cajero.setClaveCajero(rs.getString("claveCajero"));
		cajero.setNumeroEmpleado(rs.getString("numeroEmpleado"));
		cajero.setEstado(rs.getString("estado"));
		cajero.setDepartamento(rs.getInt("departamento"));
		cajero.setCorporacion(rs.getString("corporacion"));
		cajero.setEmpresa(rs.getString("empresa"));
		cajero.setUsuario(rs.getString("usuario"));
		cajero.setEmpresaFuncionario(rs.getString("empresaFuncionario"));
		cajero.setCodigoFuncionario(rs.getInt("codigoFuncionario"));
		cajero.setNombreFuncionario(rs.getString("nombreFuncionario"));
		cajero.setNivelFuncionario(rs.getInt("nivelFuncionario"));
		return cajero;
	}
}
