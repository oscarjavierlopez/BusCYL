package com.buscyl.api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buscyl.api.Jwt.JwtPrincipal;
import com.buscyl.api.dto.AsientoRequest;
import com.buscyl.api.dto.AutobusCreateRequest;
import com.buscyl.api.dto.AutobusResponse;
import com.buscyl.api.dto.AutobusUpdateRequest;
import com.buscyl.api.dto.AutobusesResponse;
import com.buscyl.api.entity.Asiento;
import com.buscyl.api.entity.Autobus;
import com.buscyl.api.entity.Empresa;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.exception.NoPerteneceEmpresaException;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.exception.PaginaNoValidaException;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.AsientoRepository;
import com.buscyl.api.repository.AutobusRepository;
import com.buscyl.api.repository.EmpresaRepository;
import com.buscyl.api.repository.UsuarioRepository;

@Service
public class AutobusServiceImpl implements AutobusService {

    @Autowired
    private AutobusRepository autobusRepository;

    @Autowired
    private AsientoRepository asientoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Override
    public AutobusesResponse obtenerAutobuesPaginados(int pagina, String matricula) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        long totalAutobuses = autobusRepository.obtenerTotalAutobuses(idEmpresa);
        long totalAutobusesFiltrados = autobusRepository.obtenerAutobusesFiltrados(matricula, idEmpresa);
        int totalPaginas = (int) Math.ceil(totalAutobusesFiltrados / 20.0);
        totalPaginas = totalPaginas > 0 ? totalPaginas : 1;

        if ((pagina > totalPaginas || pagina < 1))
            throw new PaginaNoValidaException("Página no válida");

        List<AutobusResponse> autobuses = autobusRepository.obtenerAutobusesPaginados(pagina, matricula, idEmpresa)
                .stream()
                .map(a -> Mapper.toDto(a, false,
                        asientoRepository.obtenerTotalAsientos(a.getId()),
                        asientoRepository.obtenerAsientosAdaptados(a.getId()),
                        asientoRepository.obtenerAsientosAveriados(a.getId())))
                .toList();

        Integer paginaPrevia = (pagina - 1) > 0 ? (pagina - 1) : null;
        Integer paginaSiguiente = (pagina + 1) <= totalPaginas ? (pagina + 1) : null;

        return AutobusesResponse.builder()
                .totalAutobuses(totalAutobuses)
                .totalPaginas(totalPaginas)
                .paginaPrevia(paginaPrevia)
                .pagina(pagina)
                .paginaSiguiente(paginaSiguiente)
                .autobuses(autobuses)
                .build();
    }

    @Override
    public List<AutobusResponse> obtenerAutobuses() {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        return autobusRepository.findAll()
                .stream()
                .filter(a -> a.getActivo() == true)
                .filter(a -> a.getEmpresa().getId() == idEmpresa)
                .map(a -> Mapper.toDto(a, false,
                        asientoRepository.obtenerTotalAsientos(a.getId()),
                        asientoRepository.obtenerAsientosAdaptados(a.getId()),
                        asientoRepository.obtenerAsientosAveriados(a.getId())))
                .toList();
    }

    @Override
    public AutobusResponse obtenerAutobus(Long id) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Autobus autobus = autobusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autobus no encontrado"));

        if (autobus.getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El autobus no pertenece a la empresa del usuario");
        }

        return Mapper.toDto(autobus, true,
                asientoRepository.obtenerTotalAsientos(autobus.getId()),
                asientoRepository.obtenerAsientosAdaptados(autobus.getId()),
                asientoRepository.obtenerAsientosAveriados(autobus.getId()));
    }

    @Override
    @Transactional
    public AutobusResponse crearAutobus(AutobusCreateRequest request) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Empresa empresa = empresaRepository.findById(idEmpresa)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));
        ;

        Autobus nuevoAutobus = Autobus.builder()
                .matricula(request.matricula())
                .empresa(empresa)
                .numeroBastidor(request.numeroBastidor())
                .numeroFlota(request.numeroFlota())
                .activo(true)
                .build();

        autobusRepository.save(nuevoAutobus);

        List<Asiento> asientos = new ArrayList<>();
        for (AsientoRequest a : request.asientos()) {
            Asiento nuevoAsiento = Asiento.builder()
                    .autobus(nuevoAutobus)
                    .numero(a.numero())
                    .tipo(a.tipo())
                    .activo(a.activo())
                    .build();

            asientos.add(nuevoAsiento);
            asientoRepository.save(nuevoAsiento);
        }

        nuevoAutobus.setAsientos(asientos);

        return Mapper.toDto(nuevoAutobus, true,
                asientoRepository.obtenerTotalAsientos(nuevoAutobus.getId()),
                asientoRepository.obtenerAsientosAdaptados(nuevoAutobus.getId()),
                asientoRepository.obtenerAsientosAveriados(nuevoAutobus.getId()));
    }

    @Override
    public AutobusResponse actualizarAutobus(Long id, AutobusUpdateRequest request) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Autobus autobusEditar = autobusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autobus no encontrado"));

        if (autobusEditar.getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El autobus no pertenece a la empresa del usuario");
        }

        if (request.matricula() != null) {
            autobusEditar.setMatricula(request.matricula());
        }

        if (request.numeroBastidor() != null) {
            autobusEditar.setNumeroBastidor(request.numeroBastidor());
        }

        if (request.numeroFlota() != null) {
            autobusEditar.setNumeroFlota(request.numeroFlota());
        }

        autobusRepository.save(autobusEditar);

        if (request.asientos() != null) {

            for (AsientoRequest a : request.asientos()) {
                Optional<Asiento> asiento = asientoRepository.obtenerAsientoPorNumyBus(id, a.numero());

                if (asiento.isPresent()) {
                    Asiento asientoEditar = asiento.get();
                    int indiceAsiento = autobusEditar.getIndiceAsiento(asientoEditar);
                    asientoEditar.setTipo(a.tipo());
                    asientoEditar.setActivo(a.activo());
                    asientoRepository.save(asientoEditar);
                    autobusEditar.setAsiento(indiceAsiento, asientoEditar);
                } else {
                    Asiento nuevoAsiento = Asiento.builder()
                    .autobus(autobusEditar)
                            .numero(a.numero())
                            .tipo(a.tipo())
                            .activo(a.activo())
                            .build();
                    asientoRepository.save(nuevoAsiento);
                    autobusEditar.addAsiento(nuevoAsiento);
                }
            }
        }

        return Mapper.toDto(autobusEditar, true,
                asientoRepository.obtenerTotalAsientos(autobusEditar.getId()),
                asientoRepository.obtenerAsientosAdaptados(autobusEditar.getId()),
                asientoRepository.obtenerAsientosAveriados(autobusEditar.getId()));

    }

    @Override
    public void desactivarAutobus(Long id) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Autobus autobusEditar = autobusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autobus no encontrado"));

        if (autobusEditar.getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El autobus no pertenece a la empresa del usuario");
        }

        autobusEditar.setActivo(false);
        autobusRepository.save(autobusEditar);
    }

    @Override
    public void activarAutobus(Long id) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Autobus autobusEditar = autobusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autobus no encontrado"));

        if (autobusEditar.getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El autobus no pertenece a la empresa del usuario");
        }

        autobusEditar.setActivo(true);
        autobusRepository.save(autobusEditar);
    }

}
