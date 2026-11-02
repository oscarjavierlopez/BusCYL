package com.buscyl.api.Jwt;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtServiceImpl implements JwtService {

    @Value("${buscyl.jwt.expiration-seconds}")
    private long expirationSeconds;

    @Value("${buscyl.jwt.key}")
    private String jwtSecretKey;

    @Override
    public String getToken(UserDetails usuario, Long userId, String authority) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", userId);
        extraClaims.put("role", authority);

        return getToken(extraClaims, usuario);
    }

    private String getToken(Map<String, Object> extraClaims, UserDetails usuario) {

        return Jwts.builder()
                .claims(extraClaims)
                .subject(usuario.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * expirationSeconds))
                .signWith(getKey())
                .compact();
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);

    }

    private Claims getAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public JwtPrincipal getPrincipal(String token) {
        Claims claims = getAllClaims(token);

        return new JwtPrincipal(
                claims.get("userId", Long.class),
                claims.getSubject(),
                claims.get("role", String.class));
    }

}
