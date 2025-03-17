package com.ttabong.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@EnableConfigurationProperties(JwtProperties.class) //null point exception 방지....
@ConfigurationProperties(prefix = "jwt") // application.yml의 'jwt' 값을 매핑
public class JwtProperties {
    private String secret;
    private long expiration;
}
