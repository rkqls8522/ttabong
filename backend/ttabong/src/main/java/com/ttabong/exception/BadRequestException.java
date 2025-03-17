package com.ttabong.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}