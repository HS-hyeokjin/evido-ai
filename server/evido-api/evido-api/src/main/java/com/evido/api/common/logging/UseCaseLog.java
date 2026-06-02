package com.evido.api.common.logging;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UseCaseLog {
    String value();
    LogLevel level() default LogLevel.INFO;
}