package com.buscyl.api.exception;

public class UserAlreadyCreatedException extends RuntimeException {
    public UserAlreadyCreatedException(String message) {
        super(message);
    }
}
