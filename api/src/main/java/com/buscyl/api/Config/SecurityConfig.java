package com.buscyl.api.Config;

import static jakarta.servlet.DispatcherType.ERROR;
import static jakarta.servlet.DispatcherType.FORWARD;

import java.beans.BeanProperty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.buscyl.api.Jwt.JwtAuthenticationFilter;


import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Autowired 
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired 
    private AuthenticationProvider authProvider;

    @Bean 
    public SecurityFilterChain securityFilterChain(HttpSecurity http){
        return http
        .csrf(csrf-> csrf.disable())
        .authorizeHttpRequests(authRequest -> 
            authRequest
            .dispatcherTypeMatchers(FORWARD, ERROR).permitAll()
            .requestMatchers("/auth/**").permitAll()
            .requestMatchers("/roles").hasRole("ADMINISTRADOR")
            .anyRequest().authenticated()
        )
        .sessionManagement(sessionManager ->
            sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authenticationProvider(authProvider)
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();

    }
}
