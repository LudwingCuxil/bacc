package com.bytesw.platform.bs.helper;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.ResourceBundle;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Component;

import com.bytesw.platform.utilities.trama.Campo;
import com.bytesw.platform.utilities.trama.Error;
import com.bytesw.platform.utilities.trama.PropiedadAplicacion;
import com.bytesw.platform.utilities.trama.TipoRelleno;
import com.bytesw.platform.utilities.trama.exception.InvalidSizeException;
import com.bytesw.platform.utilities.trama.exception.NullException;
import com.bytesw.platform.utilities.trama.exception.UnknownException;

@Component
public class TramaServiceHelper {

	private static final Class<Campo> CAMPO = Campo.class;
	private static final Class<PropiedadAplicacion> PROPIEDAD_APLICACION = PropiedadAplicacion.class;
	private static final ResourceBundle APP_PROPERTIES = ResourceBundle.getBundle("bundles");
	private static final Double DIEZ = 10d;
	
	protected final Log log = LogFactory.getLog(this.getClass());

	public String getTramaFromDTO(Object dto) throws NullException, InvalidSizeException, UnknownException {
		log.info("getTramaFromDTO: Procesando DTO: " + dto.getClass().getName());
		String trama = this.getTramaFromDTORecursive(dto).toString();
		log.info("Trama Creada: " + trama.length() + " [" + trama + "]");
		return trama;
	}

	@SuppressWarnings("rawtypes")
	private StringBuffer getTramaFromDTORecursive(Object dto) throws NullException, InvalidSizeException, UnknownException {
		try {
			log.info("getTramaFromDTO: Procesando DTO: " + dto.getClass().getName());
			Field[] fields = dto.getClass().getDeclaredFields();
			StringBuffer buffer = new StringBuffer();
			Campo campo = null;
			String campoFormateado = null;
//			Boolean llaveEncontrada = false;
			for (Field field : fields) {
				field.setAccessible(Boolean.TRUE);
				campo = field.getAnnotation(CAMPO);
				if (campo != null) {
					log.info("Procesando Campo: " + field.getName());
					/** SI ES LISTA */
					if (field.get(dto) instanceof List) {
						int index = 0;
						List list = (List) field.get(dto);
						for (Object o : list) {
							buffer.append(this.getTramaFromDTORecursive(o));
							index++;
							/** SEPARADOR DE ELEMENTOS Y FIN LISTA */
							if (index == list.size()) {
								buffer.append(campo.finLista());
							} else {
								buffer.append(campo.separadorElementosLista());
							}
						}
					} else {
						/** SI NO ES LISTA */
						campoFormateado = this.getStringFromField(field, campo, field.get(dto));
						if(campoFormateado != null){
							if(campo.caracterSustituto() != null && campo.sustituirCaracter() != null && campo.sustituirCaracter().length>0 && campo.caracterSustituto().length>0 && campo.sustituirCaracter().length== campo.caracterSustituto().length){
								for(int a=0; a<campo.sustituirCaracter().length; a++){
									campoFormateado = campoFormateado.replaceAll(campo.sustituirCaracter()[a], campo.caracterSustituto()[a]);
								}
							}
						}
						buffer.append(campoFormateado);
//						/** SETEO DE LLAVE A DTO */
//						if (!llaveEncontrada && field.getAnnotation(Llave.class) != null) {
//							field.set(dto, field.getType().getConstructor(String.class).newInstance(campoFormateado));
//							llaveEncontrada = true;
//						}

					}
				}
			}
			return buffer;
		} catch (NullException e) {
			log.error(e.getMessage(), e);
			throw e;
		} catch (InvalidSizeException e) {
			log.error(e.getMessage(), e);
			throw e;
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			throw new UnknownException();
		}
	}

	private String getStringFromField(final Field field, final Campo campo, Object fieldValue) throws NullException, InvalidSizeException {
		if (fieldValue == null) {
			PropiedadAplicacion property = field.getAnnotation(PROPIEDAD_APLICACION);
			if (property != null) {
				try {
					fieldValue = field.getType().getConstructor(String.class).newInstance(APP_PROPERTIES.getString(property.nombre()));
				} catch (Exception e) {
					throw new NullException(field.getName());
				}
			} else {
				// throw new NullException(field.getName());
				/** CAMBIO PARA PONER RELLENO CUANDO VALOR VENGA NULO */
				try {
					if(campo.relleno() == TipoRelleno.VACIO){
						fieldValue = TipoRelleno.VACIO.getChar();
					}else{
						fieldValue = field.getType().getConstructor(String.class).newInstance(String.valueOf(campo.relleno().getChar()));
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		/** CONVERSION A STRING */
		String valor = null;
		if (fieldValue instanceof Double) {
			double d = ((Double) fieldValue);
			d = d * Math.pow(DIEZ, campo.decimales());
			Long l = (long) d;
			valor = l.toString();
		} else if (fieldValue instanceof Date) {
			SimpleDateFormat sdf = new SimpleDateFormat(campo.formatoFecha());
			valor = sdf.format(fieldValue);
		} else {
			valor = fieldValue.toString();
		}
		/** LONGITUD */
		if (valor.length() > campo.longitud() && (-1 != campo.longitud())) {
			throw new InvalidSizeException(field.getName());
		} else if (valor.length() < campo.longitud()) {
			/** HALLAR RELLENO */
			String relleno;
			switch (campo.relleno()) {
			case DEFAULT:
				if (fieldValue instanceof Number) {
					/** NUMEROS */
					relleno = TipoRelleno.CERO.getChar();
				} else {
					/** CARACTERES Y OTROS */
					relleno = TipoRelleno.BLANCO.getChar();
				}
				break;
			default:
				/** RELLENO CONFIGURADO */
				relleno = campo.relleno().getChar();
				break;
			}

			/** RELLENO JUSTIFICADO */
			switch (campo.justificacion()) {
			case DEFAULT:
				if (fieldValue instanceof Number) {
					/** RELLENO IZQUIERDA */
					valor = StringUtils.leftPad(valor, campo.longitud(), relleno);
				} else {
					/** RELLENO DERECHA */
					valor = StringUtils.rightPad(valor, campo.longitud(), relleno);
				}
				break;
			case IZQUIERDA:
				/** RELLENO IZQUIERDA */
				valor = StringUtils.leftPad(valor, campo.longitud(), relleno);
				break;
			case DERECHA:
				/** RELLENO DERECHA */
				valor = StringUtils.rightPad(valor, campo.longitud(), relleno);
				break;
			default:
				break;
			}
		} else if (-1 == campo.longitud()) {
			// LONGITUDES VARIABLES
			valor = valor + campo.separadorLongitudVariable();
		}

		return valor;
	}

	public Object getDTOFromTrama(String trama, Object response) throws UnknownException, NullException, InvalidSizeException {
		log.info("getDTOFromTrama: Procesando DTO: " + response.getClass().getName() + " trama: " + trama);
		this.getDTOFromTramaRecursive(response, trama, 0);
		log.info("Respuesta Creada:");
		return response;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	private Integer getDTOFromTramaRecursive(Object object, String trama, Integer count) throws NullException, InvalidSizeException, UnknownException {
		Field[] fields = object.getClass().getDeclaredFields();
		int top = 0;
		String cut = null;
		Campo campo;
		Integer error = 0;
		Boolean errorEncontrado = false;
		try {
			for (Field field : fields) {
				field.setAccessible(Boolean.TRUE);
				campo = field.getAnnotation(CAMPO);
				if (campo != null) {
					log.info("Procesando Campo: " + field.getName());
					/** SI ES LISTA */
					if (field.get(object) instanceof List) {
						Class<?> tipoDeLista = (Class<?>) ((ParameterizedType) field.getGenericType()).getActualTypeArguments()[0];
						while (true) {
							/** POR SI NO HAY DETALLE */
							// if
							// (campo.finLista().equals(trama.substring(count,
							// count + 1))) {
							// count++;
							// break;
							// }
							Object detalle = tipoDeLista.newInstance();
							count = this.getDTOFromTramaRecursive(detalle, trama, count);
							((List) field.get(object)).add(detalle);
							/** SI EL SIGUIENTE ES EL FINAL DE LA LISTA */
							if (campo.finLista().equals(trama.substring(count, ++count)) || (trama.length() <= count)) {
								break;
							}
						}
					} else {
						/** SI NO ES LISTA */
						if(campo.longitud() == -1){
							top = trama.indexOf(campo.separadorLongitudVariable(), count);
							if (campo.separadorLongitudVariable().equals("") && campo.ultimoCampoIgnorarLongitud()){
								top = trama.length();
							}
						}else{
							top = count + campo.longitud();
						}
						if (trama.length() < top) {// 24 y 73
							// CAMBIO PARA QUE IGNORE LA LONGITUD DEL ULTIMO
							// CAMPO Y TOME HASTA EL FINAL.
							if (campo.ultimoCampoIgnorarLongitud()) {
								top = trama.length();
							} else {
								throw new InvalidSizeException(field.getName());
							}
						}
						cut = trama.substring(count, top).trim();
						// System.out.println( field.getName() +
						// " con el valor " + cut + " longitud " + cut.length()
						// );
						/** NO SE TOMAN EN CUENTA LOS VACIOS */
						if(cut != null && cut.length()>0){
							if(campo.caracterSustituto() != null && campo.sustituirCaracter() != null && campo.sustituirCaracter().length>0 && campo.caracterSustituto().length>0 && campo.sustituirCaracter().length== campo.caracterSustituto().length){
								for(int a=0; a<campo.sustituirCaracter().length; a++){
									cut = cut.replaceAll(campo.sustituirCaracter()[a], campo.caracterSustituto()[a]);
								}
							}
						}
						if (cut.length() != 0) {
							Object instancia = null;
							if (field.getType().isAssignableFrom(Date.class)) {
								SimpleDateFormat sdf = new SimpleDateFormat(campo.formatoFecha());
								instancia = sdf.parse(cut);
							} else {
								instancia = field.getType().getConstructor(String.class).newInstance(cut);
							}

							/** SI ES MONTO */
							if (instancia instanceof Double) {
								instancia = ((Double) instancia) / Math.pow(DIEZ, campo.decimales());
							}
							field.set(object, instancia);
						}
						/** SI ES ERROR */
						if (!errorEncontrado && field.getAnnotation(Error.class) != null) {
							error = new Integer(cut);
							errorEncontrado = true;
						}

						count = top;
						if(campo.longitud() == -1){
							count = count + campo.separadorLongitudVariable().length();
						}

						/** PARAR SI EXISTE ERROR */
						if (campo.detenerEnError() && error > 0) {
							break;
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new UnknownException();
		}
		return count;
	}

}
