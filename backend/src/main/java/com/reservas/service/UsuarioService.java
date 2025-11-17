package com.reservas.service;

import com.reservas.dto.request.UsuarioAuthDto;
import com.reservas.dto.request.UsuarioRequestDto;
import com.reservas.exception.ResourceInUseException;
import com.reservas.model.Usuario;
import com.reservas.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
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
    public List<Usuario> buscarTodos() {
        return usuarioRepository.findAll();
    }

    @Override
    public List<Usuario> buscarPorNome(String nomeCompleto) {
        if (nomeCompleto == null || nomeCompleto.trim().isEmpty()) {
            return usuarioRepository.findAll();
        }
        return usuarioRepository.findByNomeCompletoContainingIgnoreCase(nomeCompleto);
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
    public String autenticar(UsuarioAuthDto authDto) {

        Usuario usuario = buscarPorNomeUsuario(authDto.getNomeUsuario());

        if (passwordEncoder.matches(authDto.getSenha(), usuario.getSenha())) {
            return "Autenticação bem-sucedida. Bem-vindo, " + usuario.getNomeCompleto() + ".";

        } else {
            throw new IllegalArgumentException("Credenciais inválidas: Senha incorreta.");
        }
    }

    @Override
    public void validarDuplicidade(String matricula, String nomeUsuario, String email, Long idUsuarioAtual) {

        usuarioRepository.findByMatricula(matricula).ifPresent(colisor -> {

            if (idUsuarioAtual == null || !colisor.getId().equals(idUsuarioAtual)) {
                throw new IllegalArgumentException("Matrícula '" + matricula + "' já cadastrada para outro usuário.");
            }

        });

        usuarioRepository.findByNomeUsuario(nomeUsuario).ifPresent(colisor -> {
            if (idUsuarioAtual == null || !colisor.getId().equals(idUsuarioAtual)) {
                throw new IllegalArgumentException("Nome de usuário '" + nomeUsuario + "' já em uso.");
            }
        });

    }

    @Override
    @Transactional
    public Usuario salvar(UsuarioRequestDto dto) {

        validarDuplicidade(dto.getMatricula(), dto.getNomeUsuario(), dto.getEmail(), dto.getId());

        Usuario usuario = dto.getId() != null ? buscarPorId(dto.getId()) : new Usuario();

        usuario.setMatricula(dto.getMatricula());
        usuario.setNomeCompleto(dto.getNomeCompleto());
        usuario.setNomeUsuario(dto.getNomeUsuario());
        usuario.setEmail(dto.getEmail());
        usuario.setLotacao(dto.getLotacao());

        if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
            String senhaHash = passwordEncoder.encode(dto.getSenha());
            usuario.setSenha(senhaHash);
        }

        return usuarioRepository.save(usuario);
    }

    @Override
    public void deletar(Long id) {
        Usuario usuario = buscarPorId(id);
        try {
            usuarioRepository.delete(usuario);
            usuarioRepository.flush();
        } catch (DataIntegrityViolationException e) {
            String nomeUsuario = usuario.getNomeUsuario();
            throw new ResourceInUseException("Não é possível excluir o Usuário (" + nomeUsuario + ") pois ele possui Reservas registradas.");
        }
    }
}

