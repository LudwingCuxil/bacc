package com.bytesw.platform.eis.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.GregorianCalendar;

import org.springframework.jdbc.core.RowMapper;

import com.bytesw.platform.eis.bo.clientes.dominio.Genero;
import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;

public class RegistroPersonasMapper implements RowMapper<ClienteResumenDTO> {

	private static final String DIA_NACIMIENTO = "DIA_NACIMIENTO";
	private static final String MES_NACIMIENTO = "MES_NACIMIENTO";
	private static final String ANO_NACIMIENTO = "ANO_NACIMIENTO";
	private static final String M = "M";
	private static final String GENERO2 = "GENERO";
	private static final String APELLIDO_DE_CASADA = "APELLIDO_DE_CASADA";
	private static final String SEGUNDO_APELLIDO = "SEGUNDO_APELLIDO";
	private static final String PRIMER_APELLIDO = "PRIMER_APELLIDO";
	private static final String SEGUNDO_NOMBRE = "SEGUNDO_NOMBRE";
	private static final String PRIMER_NOMBRE = "PRIMER_NOMBRE";
	private static final String ID_PERSONA = "ID_PERSONA";

	public ClienteResumenDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
		ClienteResumenDTO dto = new ClienteResumenDTO();
		dto.setIdentificacion(rs.getString(ID_PERSONA));
		dto.setPrimerNombre(rs.getString(PRIMER_NOMBRE));
		dto.setSegundoNombre(rs.getString(SEGUNDO_NOMBRE));
		dto.setPrimerApellido(rs.getString(PRIMER_APELLIDO));
		dto.setSegundoApellido(rs.getString(SEGUNDO_APELLIDO));
		dto.setApellidoCasada(rs.getString(APELLIDO_DE_CASADA));
		String genero = rs.getString(GENERO2);
		if (M.equals(genero)) {
			dto.setGenero(Genero.M);
		} else {
			dto.setGenero(Genero.F);
		}
		Integer anio = rs.getInt(ANO_NACIMIENTO);
		Integer mes = rs.getInt(MES_NACIMIENTO);
		Integer dia = rs.getInt(DIA_NACIMIENTO);

		Calendar calendar = new GregorianCalendar();
		calendar.set(Calendar.YEAR, anio);
		calendar.set(Calendar.MONTH, mes);
		calendar.set(Calendar.DATE, dia);
		calendar.set(Calendar.HOUR, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);
		dto.setFecha(calendar.getTime());

		return dto;
	}

}