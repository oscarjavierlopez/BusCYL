package com.buscyl.api.Auth;

import org.jspecify.annotations.Nullable;

import jakarta.validation.Valid;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

}
