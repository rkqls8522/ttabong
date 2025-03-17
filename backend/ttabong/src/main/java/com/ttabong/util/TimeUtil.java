package com.ttabong.util;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;


public class TimeUtil {

    public static Instant toInstant(LocalDateTime localDateTime) {
        return Instant.from(localDateTime);
    }
    public static LocalDateTime toLocalDateTime(Instant instant) {
        return instant.atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();
    }
}
