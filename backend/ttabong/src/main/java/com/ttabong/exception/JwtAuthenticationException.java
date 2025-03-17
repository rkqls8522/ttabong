package com.ttabong.exception;

import org.springframework.http.HttpStatus;

public class JwtAuthenticationException extends RuntimeException {
    private final HttpStatus httpStatus;

    public JwtAuthenticationException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
