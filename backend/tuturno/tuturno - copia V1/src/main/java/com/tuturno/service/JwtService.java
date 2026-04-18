package com.tuturno.service;

import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {
    public String createToken(Long idUsuario) {
        return Jwts
                .builder()
                .claim("id-usuario", idUsuario)
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode("1234")))
                .compact();
    }

    public boolean isTokenValid(String token) {
        JwtParser jwtParser = Jwts
                .parser()
                .verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode("1234")))
                .build();

        try {
            jwtParser.parse(token);
        } catch (Exception e) {
            return false;
        }
        return true;
    }
}