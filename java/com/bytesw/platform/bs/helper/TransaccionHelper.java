package com.bytesw.platform.bs.helper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.bytesw.platform.eis.bo.depositos.TransaccionEquivalente;
import com.bytesw.platform.eis.dto.depositos.ContenidoRequestDTO;
import com.bytesw.platform.utilities.Consts;

@Component
public class TransaccionHelper {
		
	public TransaccionEquivalente getTransaccionEquivalente(List<TransaccionEquivalente> trx, String moneda, Integer tipoProducto, Integer prioridad){
		if (prioridad.compareTo(4) == 0) {
			return null;
		}
		for (TransaccionEquivalente tx : trx) {
			if (prioridad.compareTo(0) == 0) {
				if (tx.getId().getMoneda().equalsIgnoreCase(moneda) && tx.getId().getTipoProducto().compareTo(tipoProducto) == 0) {
					return tx;
				} 
			}
			if (prioridad.compareTo(1) == 0) {
				if (tx.getId().getMoneda().equalsIgnoreCase(moneda) && tx.getId().getTipoProducto().compareTo(0) == 0) {
					return tx;
				}
			}
			if (prioridad.compareTo(2) == 0) {
				if (tx.getId().getMoneda().trim().equalsIgnoreCase(Consts.EMPTY) && tx.getId().getTipoProducto().compareTo(tipoProducto) == 0) {
					return tx;
				}
			}
			if (prioridad.compareTo(3) == 0) {
				if (tx.getId().getMoneda().trim().equalsIgnoreCase(Consts.EMPTY) && tx.getId().getTipoProducto().compareTo(0) == 0) {
					return tx;
				}
			}
		}
		prioridad += 1;
		return getTransaccionEquivalente(trx, moneda, tipoProducto, prioridad);
	}
	
	public List<ContenidoRequestDTO> getContenidoRequestDTO(Object[] object) {
		List<ContenidoRequestDTO> response = new ArrayList<ContenidoRequestDTO>();
		for (int i = 0; i < object.length; i++) {
			if (object[i] != null) {
				if (object[i] instanceof BigDecimal || object[i] instanceof Double) {
					BigDecimal cien = new BigDecimal(100);
					BigDecimal bd = new BigDecimal(object[i].toString()).multiply(cien).setScale(2, RoundingMode.UNNECESSARY);
		            Long l = bd.longValue();
		            object[i] = l.toString();
				} else {
					object[i] = object[i];
				}
			} else {
				object[i] = new Long(0l);
			}
		}
		ContenidoRequestDTO c = new ContenidoRequestDTO();
		c.setTrx01(object[0]);
		c.setTrx02(object[1]);
		c.setTrx03(object[2]);
		c.setTrx04(object[3]);
		c.setTrx05(object[4]);
		c.setTrx06(object[5]);
		c.setTrx07(object[6]);
		c.setTrx08(object[7]);
		c.setTrx09(object[8]);
		c.setTrx10(object[9]);
		response.add(c);
		return response;
	}
	
}
