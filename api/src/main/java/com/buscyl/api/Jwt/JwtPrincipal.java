package com.buscyl.api.Jwt;

public record JwtPrincipal(
        Long userId,
        String email,
        String authority) {

}
