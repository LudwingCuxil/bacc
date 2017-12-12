package com.bytesw.platform.utilities;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.sql.Connection;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.StringTokenizer;

import javax.sql.DataSource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.exception.ServiceAccessException;

import net.sf.jasperreports.crosstabs.JRCrosstab;
import net.sf.jasperreports.engine.JRBreak;
import net.sf.jasperreports.engine.JRChart;
import net.sf.jasperreports.engine.JRComponentElement;
import net.sf.jasperreports.engine.JRElementGroup;
import net.sf.jasperreports.engine.JREllipse;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRExporter;
import net.sf.jasperreports.engine.JRExporterParameter;
import net.sf.jasperreports.engine.JRFrame;
import net.sf.jasperreports.engine.JRGenericElement;
import net.sf.jasperreports.engine.JRImage;
import net.sf.jasperreports.engine.JRLine;
import net.sf.jasperreports.engine.JRRectangle;
import net.sf.jasperreports.engine.JRStaticText;
import net.sf.jasperreports.engine.JRSubreport;
import net.sf.jasperreports.engine.JRTextField;
import net.sf.jasperreports.engine.JRVisitor;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRXmlDataSource;
import net.sf.jasperreports.engine.data.JsonDataSource;
import net.sf.jasperreports.engine.design.JasperDesign;
import net.sf.jasperreports.engine.export.JRCsvExporter;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.engine.export.JRXmlExporter;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.engine.util.JRElementsVisitor;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.engine.util.JRSaver;
import net.sf.jasperreports.engine.xml.JRXmlLoader;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl  {

	private final static Log log = LogFactory.getLog(ReportServiceImpl.class);
	private static final String tmp = System.getProperty("java.io.tmpdir") + File.separatorChar;

	private DataSource dataSource;

	@Autowired
	public ReportServiceImpl(@Qualifier("dataSource") DataSource dataSource){
		this.dataSource = dataSource;
	}

	@SuppressWarnings("unchecked")
	public byte[] generateReport(ReporteRequestDTO req) throws ServiceAccessException {
		Map<String, Object> parameters = new HashMap<String, Object>();
		String nameReport;
		Connection conn = null;

		String xmlDS = null;
		String jsonDS = null;
		String selectExpressionXPath = null;
		try {
			for (Parametro parametro : req.getParam()) {
				if (parametro.getDetalleParametro().getTipo() != null) {
					if (TipoParametro.IMAGE == parametro.getDetalleParametro()
							.getTipo()) {
						URL url = getClass().getResource(
								parametro.getDetalleParametro().getValue()
										.toString());
						parametro.getDetalleParametro().setValue(url.getFile());
					} else if (TipoParametro.RESOURCE_BUNDLE == parametro
							.getDetalleParametro().getTipo()) {
						// En value viene el nombre del archivo
						ResourceBundle rb = ResourceBundle.getBundle(parametro
								.getDetalleParametro().getValue().toString());
						parametro.getDetalleParametro().setValue(rb.toString());
					} else if (TipoParametro.XML_DATA_SOURCE == parametro
							.getDetalleParametro().getTipo()) {
						xmlDS = parametro.getDetalleParametro().getValue()
								.toString();
						selectExpressionXPath = parametro.getDetalleParametro()
								.getXpath();
						
					}
					else if(TipoParametro.JSON_DATA_SOURCE == parametro
							.getDetalleParametro().getTipo()){
						jsonDS = parametro.getDetalleParametro().getValue()
								.toString();
						selectExpressionXPath = parametro.getDetalleParametro().getXpath();
					}
					parameters.put(parametro.getKey(), parametro
							.getDetalleParametro().getValue());
				} else {
					@SuppressWarnings("rawtypes")
					Class paramClazz = parametro.getDetalleParametro().getClase();
					if (paramClazz.isEnum()) {
						parameters.put(parametro.getKey(), Enum.valueOf(
								paramClazz, parametro.getDetalleParametro()
										.getValue()));
					} else {
						parameters.put(
								parametro.getKey(),
								paramClazz.getConstructor(String.class)
										.newInstance(
												parametro.getDetalleParametro()
														.getValue()));
					}
				}
			}
			parameters.put("url",tmp);
			
			// Exporter
			JRExporter exporter = null;
			if (TipoReporte.CSV.equals(req.getTipoReporte())) {
				exporter = new JRCsvExporter();
			} else if (TipoReporte.XLS.equals(req.getTipoReporte())) {
				exporter = new JRXlsxExporter();
			} else if (TipoReporte.XML.equals(req.getTipoReporte())) {
				exporter = new JRXmlExporter();
			} else {
				exporter = new JRPdfExporter();
			}

			// Generacion
			nameReport = parameters.get("name").toString();

			JasperReport jr = loadReport(nameReport, parameters);

			JasperPrint print = null;
			if (xmlDS == null && jsonDS == null) {
				conn = dataSource.getConnection();
				print = JasperFillManager.fillReport(jr, parameters, conn);
			} else {

				if (jsonDS != null) {
					InputStream stream = new ByteArrayInputStream(
							jsonDS.getBytes());
					JsonDataSource js = new JsonDataSource(stream,selectExpressionXPath);
					print = JasperFillManager.fillReport(jr, parameters, js);
				} else {
					JRXmlDataSource ds = new JRXmlDataSource(
							new ByteArrayInputStream(xmlDS.getBytes()),
							selectExpressionXPath != null ? selectExpressionXPath
									: ".");
					print = JasperFillManager.fillReport(jr, parameters, ds);
				}
			}

			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			exporter.setParameter(JRExporterParameter.JASPER_PRINT, print);
			exporter.setParameter(JRExporterParameter.OUTPUT_STREAM, baos);
			String hora = ""+System.currentTimeMillis();
		//	JasperExportManager.exportReportToPdfFile(print,"/btf/"+hora+"doc.pdf");
			
			exporter.exportReport();

			return baos.toByteArray();

		} catch (Exception e) {
			log.info("problema en coneccion:", e);
			e.printStackTrace();
			throw new ServiceAccessException(e.getMessage());
		} finally {
			if (conn != null) {
				try {
					conn.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}

	public DataSource getDataSource() {
		return dataSource;
	}

	public void setDataSource(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	public JasperReport loadReport(String reportName,
			final Map<String, Object> parameters) throws JRException {
		String nameFile = reportName.substring(reportName.lastIndexOf("/") + 1,
				reportName.lastIndexOf("."));
		File f = new File(tmp + nameFile + ".jasper");
		if (f.exists()) {
			return (JasperReport) JRLoader.loadObject(f);
		} else {
			URL url = getClass().getResource(reportName);
			JasperDesign jasperDesign = JRXmlLoader.load(url.getFile());
			JasperReport jasperReport = JasperCompileManager
					.compileReport(jasperDesign);
			JRSaver.saveObject(jasperReport, tmp + nameFile + ".jasper");

			final List<String> subreports = new ArrayList<String>();
			// Compile sub reports
			JRElementsVisitor.visitReport(jasperReport, new JRVisitor() {
				@Override
				public void visitBreak(JRBreak breakElement) {
				}

				@Override
				public void visitChart(JRChart chart) {
				}

				@Override
				public void visitCrosstab(JRCrosstab crosstab) {
				}

				@Override
				public void visitElementGroup(JRElementGroup elementGroup) {
				}

				@Override
				public void visitEllipse(JREllipse ellipse) {
				}

				@Override
				public void visitFrame(JRFrame frame) {
				}

				@Override
				public void visitImage(JRImage image) {
				}

				@Override
				public void visitLine(JRLine line) {
				}

				@Override
				public void visitRectangle(JRRectangle rectangle) {
				}

				@Override
				public void visitStaticText(JRStaticText staticText) {
				}

				@Override
				public void visitSubreport(JRSubreport subreport) {
					try {
						String expression = subreport.getExpression().getText()
								.replace(".jasper", "");
						StringTokenizer st = new StringTokenizer(expression,
								"\"/");
						String subReportName = null;
						while (st.hasMoreTokens())
							subReportName = st.nextToken();
						// Sometimes the same subreport can be used multiple
						// times, but
						// there is no need to compile multiple times

						for (Map.Entry<String, Object> entry : parameters
								.entrySet()) {
							String valor = entry.getKey();
							if (subReportName.contains(valor)
									&& !entry.getKey().equals("")) {
								subReportName = entry.getValue().toString();
								subReportName = subReportName
										.substring(
												subReportName
														.lastIndexOf(File.separatorChar) + 1)
										.replace(".jasper", "");
								break;
							}
						}
						if (subreports.contains(subReportName))
							return;
						subreports.add(subReportName);
						loadReport("/reports/"+subReportName+".jrxml", parameters);

					} catch (Throwable e) {
						e.printStackTrace();
					}
				}

				@Override
				public void visitTextField(JRTextField textField) {
				}

				@Override
				public void visitComponentElement(
						JRComponentElement componentElement) {
				}

				@Override
				public void visitGenericElement(JRGenericElement element) {
				}
			});

			return jasperReport;
		}

	}

	public static void main(String[] args) {
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
		Date a = new Date();
		System.out.println(a.toString());
	}

}

