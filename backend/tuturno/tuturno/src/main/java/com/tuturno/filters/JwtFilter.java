package com.tuturno.filters;

import com.tuturno.service.JwtService;
import com.tuturno.repository.UsuarioRepository;
import com.tuturno.model.Usuario;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        final String token = header.substring(7);

        try {
            if (this.jwtService.isTokenValid(token)) {
                Long userId = this.jwtService.getUserIdFromToken(token);
                
                Usuario usuario = this.usuarioRepository.findById(userId).orElse(null);
                if (usuario != null) {
                    // Add the strict ROLE_ prefix so Spring Security `@PreAuthorize("hasAnyRole(...)")` matches.
                    String roleName = "ROLE_" + usuario.getRol().name().toUpperCase();
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId, null, List.of(new SimpleGrantedAuthority(roleName))
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            System.err.println("🔴 Error procesando el JWT en el Filtro: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}