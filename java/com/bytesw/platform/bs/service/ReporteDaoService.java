package com.bytesw.platform.bs.service;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.depositos.CuentaDao;
import com.bytesw.platform.bs.helper.CuentaHelper;
import com.bytesw.platform.eis.bo.clientes.ActividadEconomica;
import com.bytesw.platform.eis.bo.clientes.Pais;
import com.bytesw.platform.eis.bo.reportes.ReporteBeneficiario;
import com.bytesw.platform.eis.bo.reportes.ReporteBeneficiarioFinal;
import com.bytesw.platform.eis.bo.reportes.ReporteComplemento;
import com.bytesw.platform.eis.bo.reportes.ReporteCuenta;
import com.bytesw.platform.eis.bo.reportes.ReporteCuentaGenerales;
import com.bytesw.platform.eis.bo.reportes.ReporteDependiente;
import com.bytesw.platform.eis.bo.reportes.ReporteDependienteIndividual;
import com.bytesw.platform.eis.bo.reportes.ReporteDetalleFuturoCrece;
import com.bytesw.platform.eis.bo.reportes.ReporteDireccionCliente;
import com.bytesw.platform.eis.bo.reportes.ReporteFuturoCrece;
import com.bytesw.platform.eis.bo.reportes.ReporteIdFirmantes;
import com.bytesw.platform.eis.bo.reportes.ReportePersonaJuridica;
import com.bytesw.platform.eis.bo.reportes.ReportePersonaNatural;
import com.bytesw.platform.eis.bo.reportes.ReporteProducto;
import com.bytesw.platform.eis.bo.reportes.ReporteProveedor;
import com.bytesw.platform.eis.bo.reportes.ReporteRefPersonales;
import com.bytesw.platform.eis.bo.reportes.ReporteReferencia;
import com.bytesw.platform.eis.bo.reportes.ReporteRepresentante;
import com.bytesw.platform.eis.bo.reportes.ReporteSocio;
import com.bytesw.platform.utilities.ReportServiceImpl;




@SuppressWarnings("unchecked")
@Service
@PropertySource("classpath:error-message.properties")
public class ReporteDaoService {
	
	
	
	
	
	
	
	



}
