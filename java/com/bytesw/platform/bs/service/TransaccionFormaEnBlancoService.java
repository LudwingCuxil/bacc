package com.bytesw.platform.bs.service;

import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.dto.depositos.TrxFormaEnBlancoRequestDTO;
import com.bytesw.platform.eis.dto.depositos.TrxFormaEnBlancoResponseDTO;

public interface TransaccionFormaEnBlancoService {

	public TrxFormaEnBlancoResponseDTO procesar(TrxFormaEnBlancoRequestDTO req) throws ServiceAccessException;
		
}