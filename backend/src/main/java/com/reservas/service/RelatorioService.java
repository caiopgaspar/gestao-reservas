package com.reservas.service;

import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.util.JRLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;


import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@Service
public class RelatorioService {

    @Autowired
    private DataSource dataSource;

    public byte[] gerarRelatorioRecursos() throws Exception {
        // Usando o nome correto do seu arquivo: listaRecursos
        ClassPathResource resource = new ClassPathResource("reports/listaRecursos.jasper");
        
        // Se não tiver o .jasper, use o .jrxml (compila em tempo real)
        if (!resource.exists()) {
            resource = new ClassPathResource("reports/listaRecursos.jrxml");
        }
        
        System.out.println("Carregando relatório de: " + resource.getPath());
        
        InputStream inputStream = resource.getInputStream();
        
        // Se for .jrxml, compila; se for .jasper, carrega diretamente
        JasperReport jasperReport;
        if (resource.getPath().endsWith(".jrxml")) {
            jasperReport = JasperCompileManager.compileReport(inputStream);
            System.out.println("Relatório compilado do .jrxml");
        } else {
            jasperReport = (JasperReport) JRLoader.loadObject(inputStream);
            System.out.println("Relatório carregado do .jasper");
        }
        
        Map<String, Object> parametros = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parametros, connection);
            System.out.println("Relatório preenchido com sucesso");
            return JasperExportManager.exportReportToPdf(jasperPrint);
        }
    }
}