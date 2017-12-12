package com.bytesw.platform.bs.helper;

import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import org.springframework.stereotype.Component;

import com.bytesw.platform.eis.bo.depositos.CalculoDigitoVerificador;
import com.bytesw.platform.eis.bo.depositos.RegistroControl;
import com.bytesw.platform.eis.bo.plataforma.FormularioProducto;
import com.bytesw.platform.eis.dto.depositos.BeneficiarioDTO;
import com.bytesw.platform.eis.dto.depositos.BeneficiarioFinalDTO;
import com.bytesw.platform.utilities.Consts;

@Component
public class CuentaHelper {
	
	private static int PRTIPO_LENGTH = 2;
	private static int DPAGEN_LENGTH = 3;
	private static int DPCORR_LENGTH = 6;
	
	public Integer getDigitoVerificador10(Integer prtipo, Integer dpagen, Integer dpcorr, CalculoDigitoVerificador cdv){
		Integer response = Integer.MIN_VALUE;
		try {
			String cuenta = getValueToCuenta(prtipo, dpagen, dpcorr, Consts.EMPTY).toString();
			Integer[] pesos = cdv.getPesos();
			Integer sumatoria = 0;
			for (int i = 0; i < cuenta.length(); i++) {
				Integer digito = Integer.parseInt(cuenta.substring(i, i + 1));
				Integer peso = pesos[i];
				String value = Consts.valueToLength((digito * peso) + "", 2, "0");
				sumatoria += Integer.parseInt(value.substring(0, 1)) + Integer.parseInt(value.substring(1, value.length()));
			}
			if (sumatoria.compareTo(10) < 0) {
				response = 10 - sumatoria;
			} else {
				Integer residuo = sumatoria % 10;
				if (residuo.compareTo(0) != 0) {
					response = ((sumatoria - residuo) + 10) - sumatoria;
				} else {
					response = (sumatoria - residuo) - sumatoria;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			response = null;
		}
		return response;
	}
	
	public Integer getDigitoVerificador11(Integer prtipo, Integer dpagen, Integer dpcorr, CalculoDigitoVerificador cdv){
		return null;
	}
	
	public String getCuentaEditada(Integer prtipo, Integer dpagen, Integer dpcorr, Integer dpdive, String separator){
		StringBuilder response = getValueToCuenta(prtipo, dpagen, dpcorr, separator);
		response.append(separator);
		response.append(dpdive.toString());
		return response.toString();
	}
	
	public Date getFechaOperacion(RegistroControl rc) throws ParseException {
		Date fechaOperacion = null;
		if (null != rc.getFecha()) {
			String fecha = rc.getFecha().toString();
			if (fecha.length() == 7) {
				fecha = "0" + fecha;
			}
			fechaOperacion= Consts.DPREGCON_FORMAT.parse(fecha);
		}
		return fechaOperacion;
	}
	
	private StringBuilder getValueToCuenta(Integer prtipo, Integer dpagen, Integer dpcorr, String separator){
		StringBuilder response = new StringBuilder();
		String tipoProducto = Consts.valueToLength(prtipo.toString(), PRTIPO_LENGTH, "0");
		String agencia = Consts.valueToLength(dpagen.toString(), DPAGEN_LENGTH, "0");
		String correlativo = Consts.valueToLength(dpcorr.toString(), DPCORR_LENGTH, "0");
		response.append(tipoProducto);
		response.append(separator);
		response.append(agencia);
		response.append(separator);
		response.append(correlativo);
		return response;
	}
	
	public String getNombreCompleto(BeneficiarioDTO b){
		StringBuilder response = this.getNombreCompleto(b.getPrimerApellido(), b.getSegundoApellido(), b.getApellidoCasada(), b.getPrimerNombre(), b.getSegundoNombre());
		if (response.length() > 47) { 
			// CAMBIO POR DPBENAC.BENOMB
			String valor = response.substring(0, 47);
			response.delete(0, response.length());
			response.append(valor);
		}
		return response.toString();
	}
	
	public String getNombreCompleto(BeneficiarioFinalDTO b){
		StringBuilder response = this.getNombreCompleto(b.getPrimerApellido(), b.getSegundoApellido(), b.getApellidoCasada(), b.getPrimerNombre(), b.getSegundoNombre());
		return response.toString();
	}
	
	public StringBuilder getNombreCompleto(String primerApellido, String segundoApellido, String apellidoCasada, String primerNombre, String segundoNombre){
		StringBuilder response = new StringBuilder();
		response.append(primerApellido);
		response.append(null != segundoApellido && !Consts.EMPTY.equals(segundoApellido) ? Consts.BLANK + segundoApellido.trim() : Consts.EMPTY);
		response.append(null != apellidoCasada && !Consts.EMPTY.equals(apellidoCasada) ? Consts.BLANK + Consts.DE + Consts.BLANK + apellidoCasada.trim() : Consts.EMPTY);
		response.append(Consts.BLANK);
		response.append(primerNombre);
		response.append(null != segundoNombre && !Consts.EMPTY.equals(segundoNombre) ? Consts.BLANK + segundoNombre.trim() : Consts.EMPTY);
		return response;
	}
	
	public String concat(Integer prtipo, Integer dpagen, Integer dpcorr, Integer dpdive){
		StringBuilder response = new StringBuilder();
		response.append(prtipo);
		response.append(dpagen);
		response.append(dpcorr);
		response.append(dpdive);
		return response.toString();
	}
	
	public Date addCalendarMonth(Date now, Integer month) {
		Calendar calendar = java.util.Calendar.getInstance();
	    calendar.setTime(now);
	    calendar.add(Calendar.MONTH, month);
	    return calendar.getTime();
	}
	
	public Date addCalendarDayOfYear(Date now, Integer day) {
		Calendar calendar = Calendar.getInstance();
	    calendar.setTime(now);
	    calendar.add(Calendar.DAY_OF_YEAR, day);
	    return calendar.getTime();
	}
	
	public Date addCalendarDayOfMonth(Date now, Integer day) {
		Calendar calendar = Calendar.getInstance();
	    calendar.setTime(now);
	    calendar.add(Calendar.DAY_OF_MONTH, day);
	    return calendar.getTime();
	}
	
	public Integer lastDayOfMonth(Date date) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		return calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
	}
	
	public Boolean isLeapYear(Integer anio) {
		GregorianCalendar calendar = new GregorianCalendar();
	    return calendar.isLeapYear(anio);
	}
	
	public Integer getDayOfMonth(Date date){
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		return calendar.get(Calendar.DAY_OF_MONTH);
	}
	
	public Date getFechaVencimientoComercialAS400(Date fecha, Integer plazoDias) {
		if (null == plazoDias) {
			return fecha;
		}
		Calendar fechaInicio = Calendar.getInstance();
		fechaInicio.setTime(fecha);
		Integer diasx = plazoDias - 1;
		Integer meses = diasx / 30;
		Integer diaso = diasx % 30;
		
		Integer aniof = fechaInicio.get(Calendar.YEAR);
		Integer mesfx = fechaInicio.get(Calendar.MONTH) + meses;
		while (mesfx > 12) {
			mesfx = mesfx - 12;
			aniof = aniof + 1;
		}
		Integer mesf = mesfx;
		Integer diaf = fechaInicio.get(Calendar.DAY_OF_MONTH) + diaso;
		while (diaf > 30) {
			diaf = diaf - 30;
			mesf = mesf + 1;
			if (mesf > 12) {
				mesf = 1;
				aniof = aniof + 1;
			}
		}
		Calendar fechaFinal = Calendar.getInstance();
		fechaFinal.set(aniof, mesf, diaf);
		return fechaFinal.getTime();
	}
	
	public Date getFechaVencimientoComercial(Date fecha, Integer plazoDias) {
		if (null == plazoDias) {
			return fecha;
		}
		Calendar fechaInicio = Calendar.getInstance();
		fechaInicio.setTime(fecha);
		Integer dia = fechaInicio.get(Calendar.DAY_OF_MONTH) - 1;
		Date fechaVencimiento = fechaInicio.getTime();
		Integer meses = plazoDias / Consts.DIAS_360;
		for (int i = 1 ; i <= meses; i++) {
			fechaVencimiento = addCalendarMonth(fechaVencimiento, 1);
			if (lastDayOfMonth(fechaVencimiento).compareTo(Consts.DIAS_360) < 0) {
				fechaVencimiento = addCalendarDayOfMonth(fechaVencimiento, 1);
			}
		}
		Integer residuo = plazoDias % Consts.DIAS_360;
		Calendar fechaFinal = Calendar.getInstance();
		if (residuo.compareTo(0) > 0) {
			fechaVencimiento = addCalendarDayOfMonth(fechaVencimiento, residuo);
			dia = getDayOfMonth(fechaVencimiento);
		}
		fechaFinal.setTime(fechaVencimiento);
		fechaFinal.set(fechaFinal.get(Calendar.YEAR), fechaFinal.get(Calendar.MONTH), dia.compareTo(0) == 0 ? -1 : dia);
		return fechaFinal.getTime();
	}
	
	public Date getFechaVencimientoCalendario(Date fecha, Integer plazoDias) {
		if (null == plazoDias) {
			return fecha;
		}
		return this.addCalendarDayOfYear(fecha, plazoDias - 1);
	}
	
	public boolean isEnableFormulario(List<FormularioProducto> productosValidos, Integer subProducto){
		for (FormularioProducto valido : productosValidos) {
			if (valido.getSubProducto().compareTo(subProducto) == 0) {
				return true;
			} else if (valido.getSubProducto().compareTo(0) == 0) {
				return true;
			}
		}
		return false;
	}
	
	public static void main(String[] args) {
		Calendar fecha = Calendar.getInstance();
		fecha.set(Calendar.YEAR, 2017);
		fecha.set(Calendar.MONTH, 7);
		fecha.set(Calendar.DAY_OF_MONTH, 1);
		
		System.out.println(fecha.getTime());
		
		Integer diasPlazo = 900;
		Integer diasx = diasPlazo - 1;
		Integer meses = diasx / 30;
		Integer diaso = diasx % 30;
		
		Integer aniof = fecha.get(Calendar.YEAR);
		Integer mesfx = (fecha.get(Calendar.MONTH) + 1) + meses;
		while (mesfx > 12) {
			mesfx = mesfx - 12;
			aniof = aniof + 1;
		}
		Integer mesf = mesfx;
		Integer diaf = fecha.get(Calendar.DAY_OF_MONTH) + diaso;
		while (diaf > 30) {
			diaf = diaf - 30;
			mesf = mesf + 1;
			if (mesf > 12) {
				mesf = 1;
				aniof = aniof + 1;
			}
		}
		System.out.println(diaf + "/" +  mesf + "/" + aniof);
		
		CuentaHelper helper = new CuentaHelper();
		Date vencimientoComercial = helper.getFechaVencimientoComercial(fecha.getTime(), diasPlazo);
		System.out.println(vencimientoComercial);
		
		Date vencimientoComercialAS400 = helper.getFechaVencimientoComercialAS400(fecha.getTime(), diasPlazo);
		System.out.println(vencimientoComercialAS400);
		
		Date vencimientoCalendario = helper.getFechaVencimientoCalendario(fecha.getTime(), diasPlazo);
		System.out.println(vencimientoCalendario);
	}
	
}
