package com.reservas.service;

import com.reservas.dto.request.UsuarioRequestDto;
import com.reservas.model.Usuario;
import com.reservas.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UsuarioService implements  IUsuarioService{

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuário com ID " + id + " não encontrado."));
    }

    @Override
    public Usuario buscarPorNomeUsuario(String nomeUsuario) {
        return usuarioRepository.findByNomeUsuario(nomeUsuario)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + nomeUsuario));
    }

    @Override
    public Usuario buscarPorMatricula(String matricula) {
        return usuarioRepository.findByMatricula(matricula)
                .orElseThrow(() -> new NoSuchElementException("Matrícula não encontrada: " + matricula));
    }

    @Override
    public Usuario buscarPorEmail(String email){
        return  usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("E-mail não encontrado: " + email));
    }

    @Override
    public void validarDuplicidade(String matricula, String nomeUsuario) {

        if (usuarioRepository.findByMatricula(matricula).isPresent()){
            throw new IllegalArgumentException("Matrícula já cadastrada.");
        }

        if (usuarioRepository.findByNomeUsuario(nomeUsuario).isPresent()){
            throw new IllegalArgumentException("Nome de usuário já em uso");
        }

    }

    @Override
    @Transactional
    public Usuario salvar(UsuarioRequestDto dto) {

            validarDuplicidade(dto.getMatricula(), dto.getNomeUsuario());

            Usuario usuario = new Usuario(
                    dto.getMatricula(),
                    dto.getNomeCompleto(),
                    dto.getNomeUsuario(),
                    dto.getLotacao()
            );

            if (dto.getId() != null) {
                usuario.setId(dto.getId());
            }

            String senhaHash = passwordEncoder.encode(dto.getSenha());
            usuario.setSenha(senhaHash);

            return usuarioRepository.save(usuario);

    }

    @Override
    public void deletar(Long id) {
            Usuario usuario = buscarPorId(id); // Garante que o usuário existe
            usuarioRepository.delete(usuario);
    }
}

