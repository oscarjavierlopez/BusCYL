package com.buscyl.api.Jwt;

import java.security.Key;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String getToken(UserDetails usuario, Long userId, String authority);

    JwtPrincipal getPrincipal(String token);
}
