package com.reservas.controller;

import com.reservas.service.RelatorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "http://localhost:4200")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    @GetMapping("/recursos")
    public ResponseEntity<byte[]> gerarRelatorioRecursos() {
        try {
            // Chama o método que existe no Service
            byte[] relatorioPdf = relatorioService.gerarRelatorioRecursos();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "relatorio_recursos.pdf");
            
            return ResponseEntity.ok().headers(headers).body(relatorioPdf);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}