package com.ttabong.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class LoggerConfig {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    //default Logger logger() {
    //    return LoggerFactory.getLogger(this.getClass().getSuperclass());
    //}
}
