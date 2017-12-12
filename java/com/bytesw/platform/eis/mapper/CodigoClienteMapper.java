package com.bytesw.platform.eis.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

public class CodigoClienteMapper implements RowMapper<Long> {

	public Long mapRow(ResultSet rs, int rowNum) throws SQLException {
		return rs.getLong(1);
	}
}
