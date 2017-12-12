package com.bytesw.platform.eis.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

public class BooleanMapper implements RowMapper<Boolean> {

	public Boolean mapRow(ResultSet rs, int rowNum) throws SQLException {
		Integer response = rs.getInt(1); 
		return response.compareTo(0) > 0;
	}
	
}
