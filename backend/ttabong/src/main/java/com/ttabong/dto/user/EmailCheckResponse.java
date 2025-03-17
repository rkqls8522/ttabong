package com.ttabong.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmailCheckResponse {
    private int status;
    private boolean exists;
    private String message;
}
