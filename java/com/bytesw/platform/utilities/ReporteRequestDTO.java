package com.bytesw.platform.utilities;


import java.util.ArrayList;



public class ReporteRequestDTO  {
	private static final long serialVersionUID = 2492718850321502558L;

	private String ip;
	private TipoReporte tipoReporte;
	private ArrayList<Parametro> param;
	private String entidad;
	
	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public ArrayList<Parametro> getParam() {
		return param;
	}

	public void setParam(ArrayList<Parametro> param) {
		this.param = param;
	}

	public TipoReporte getTipoReporte() {
		return tipoReporte;
	}

	public void setTipoReporte(TipoReporte tipoReporte) {
		this.tipoReporte = tipoReporte;
	}

	public String getEntidad() {
		return entidad;
	}

	public void setEntidad(String entidad) {
		this.entidad = entidad;
	}
}
