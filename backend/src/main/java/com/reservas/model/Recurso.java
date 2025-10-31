package com.reservas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "recurso")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Configura a geração automática do ID pelo banco de dados
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "codigo_identificacao", nullable = false, unique = true, length = 50)
    private String codigoIdentificacao;

    @Column(length = 255)
    private String localizacao;

    private Integer capacidade;

    // --- Relacionamento Many-to-One com TipoRecurso ---
    /*
     * Muitas instâncias de Recurso (N) pertencem a um único TipoRecurso (1).
     * O JoinColumn indica qual coluna será a chave estrangeira na tabela 'recurso'.
     */
    @ManyToOne(fetch = FetchType.LAZY) // LAZY é comum para evitar carregar o objeto inteiro em consultas simples
    @JoinColumn(name = "tipo_recurso_id", nullable = false)
    private TipoRecurso tipo;


    // NOTA: Métodos de negócio como 'validarDisponibilidade()' ficam na camada Service,
    // mas poderiam ser adicionados aqui como métodos simples de objeto, se necessário.

    // Exemplo de método utilitário (opcional)
    public boolean temCapacidadeSuficiente(int quantidadePessoas) {
        return this.capacidade != null && quantidadePessoas <= this.capacidade;
    }
}