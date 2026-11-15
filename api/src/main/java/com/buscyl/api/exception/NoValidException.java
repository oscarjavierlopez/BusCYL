package com.buscyl.api.exception;

public class NoValidException extends RuntimeException{
    public NoValidException(String message){
        super(message);
    }
}
