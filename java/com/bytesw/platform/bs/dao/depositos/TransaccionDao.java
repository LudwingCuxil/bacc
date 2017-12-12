package com.bytesw.platform.bs.dao.depositos;

public interface TransaccionDao {
	
	public Long getCorrelativoTransaccion(String trxdc);
	public void updateCorrelativoTransaccion(String trxdc, Long correlativo);

}
