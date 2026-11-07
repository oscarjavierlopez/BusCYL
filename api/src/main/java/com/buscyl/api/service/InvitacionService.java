package com.buscyl.api.service;

import com.buscyl.api.Auth.ForgotPasswordRequest;
import com.buscyl.api.Auth.ForgotPasswordResponse;

public interface InvitacionService {

    ForgotPasswordResponse enviarInvitacion(ForgotPasswordRequest request);

}
