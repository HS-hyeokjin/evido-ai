package com.evido.api.common.logging;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Slf4j
@Aspect
@Component
public class UseCaseLogAspect {

    @Around("@annotation(useCaseLog)")
    public Object logUseCase(
            ProceedingJoinPoint joinPoint,
            UseCaseLog useCaseLog
    ) throws Throwable {
        long start = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();

        try {
            Object result = joinPoint.proceed();

            long durationMs = System.currentTimeMillis() - start;
            Integer resultCount = getResultCount(result);

            logSuccess(useCaseLog, methodName, durationMs, resultCount);

            return result;
        } catch (Exception e) {
            long durationMs = System.currentTimeMillis() - start;

            log.warn(
                    "UseCase failed. action={}, method={}, durationMs={}, exception={}",
                    useCaseLog.value(),
                    methodName,
                    durationMs,
                    e.getClass().getSimpleName()
            );

            throw e;
        }
    }

    private void logSuccess(
            UseCaseLog useCaseLog,
            String methodName,
            long durationMs,
            Integer resultCount
    ) {
        if (useCaseLog.level() == LogLevel.DEBUG) {
            log.debug(
                    "UseCase completed. action={}, method={}, durationMs={}, resultCount={}",
                    useCaseLog.value(),
                    methodName,
                    durationMs,
                    resultCount
            );
            return;
        }

        log.info(
                "UseCase completed. action={}, method={}, durationMs={}, resultCount={}",
                useCaseLog.value(),
                methodName,
                durationMs,
                resultCount
        );
    }

    private Integer getResultCount(Object result) {
        if (result instanceof Collection<?> collection) {
            return collection.size();
        }

        return null;
    }
}