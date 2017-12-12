package com.bytesw.platform.bs.service;

import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.depositos.TransaccionEquivalente;
import com.bytesw.platform.eis.dto.depositos.GeneraIndiceRequestDTO;
import com.bytesw.platform.eis.dto.depositos.TransaccionRequestDTO;
import com.bytesw.platform.eis.dto.depositos.TransaccionResponseDTO;

public interface TransaccionService {

	public TransaccionResponseDTO procesarTransaccion(TransaccionRequestDTO req) throws ServiceAccessException;
	
	public boolean generarIndiceCuenta(GeneraIndiceRequestDTO req) throws ServiceAccessException;
	
	public TransaccionEquivalente findTransaccionEquivalente(String equivalente, String moneda, Integer tipoProducto) throws ServiceAccessException;
	
	public Long getCorrelativoTransaccion(String trxdc) throws ServiceAccessException;
		
}