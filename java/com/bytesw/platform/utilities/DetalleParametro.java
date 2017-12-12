package com.bytesw.platform.utilities;

public class DetalleParametro {

	private TipoParametro tipo;
	private String value;
	private Class<?> clase;
	private String xpath;
	
	public DetalleParametro() {
	}

	public TipoParametro getTipo() {
		return tipo;
	}

	public void setTipo(TipoParametro tipo) {
		this.tipo = tipo;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getXpath() {
		return xpath;
	}

	public void setXpath(String xpath) {
		this.xpath = xpath;
	}

	public Class<?> getClase() {
		return clase;
	}

	public void setClase(Class<?> clase) {
		this.clase = clase;
	}

	

}