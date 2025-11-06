package com.reservas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recurso")
@Getter
@Setter
@NoArgsConstructor

public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "codigo_identificacao", nullable = false, unique = true, length = 50)
    private String codigoIdentificacao;

    @Column(length = 255)
    private String localizacao;

    private Integer capacidade;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_recurso_id", nullable = false)
    private TipoRecurso tipo;


    public boolean temCapacidadeSuficiente(int quantidadePessoas) {
        return this.capacidade != null && quantidadePessoas <= this.capacidade;
    }


    public Recurso(String nome, String codigoIdentificacao, String localizacao, Integer capacidade, TipoRecurso tipo) {
        this.nome = nome;
        this.codigoIdentificacao = codigoIdentificacao;
        this.localizacao = localizacao;
        this.capacidade = capacidade;
        this.tipo = tipo;
    }
}