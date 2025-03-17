package com.ttabong.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class RedundantException extends RuntimeException {
    public RedundantException(String message) {
        super(message);
    }
}