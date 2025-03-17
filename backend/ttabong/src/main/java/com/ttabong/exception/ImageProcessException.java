package com.ttabong.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class ImageProcessException extends RuntimeException {
    public ImageProcessException(String message) {
        super(message);
    }

    public ImageProcessException(String message, Throwable cause) {
        super(message, cause);
    }
}