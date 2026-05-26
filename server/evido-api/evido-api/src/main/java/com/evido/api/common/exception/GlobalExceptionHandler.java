package com.evido.api.common.exception;

import com.evido.api.common.response.CommonResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<CommonResponse<Void>> handleBusinessException(
            BusinessException e,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = e.getErrorCode();

        log.warn(
                "[비즈니스 예외] code={}, message={}, path={}",
                errorCode.getCode(),
                e.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(CommonResponse.fail(
                        errorCode.getCode(),
                        e.getMessage()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e,
            HttpServletRequest request
    ) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("잘못된 입력값입니다.");

        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;

        log.warn(
                "[요청 값 검증 실패] message={}, path={}",
                message,
                request.getRequestURI()
        );

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(CommonResponse.fail(
                        errorCode.getCode(),
                        message
                ));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<CommonResponse<Void>> handleMaxUploadSizeException(
            MaxUploadSizeExceededException e,
            HttpServletRequest request
    ) {
        log.warn(
                "[업로드 파일 용량 초과] path={}, message={}",
                request.getRequestURI(),
                e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(CommonResponse.fail(
                        "FILE_SIZE_EXCEEDED",
                        "업로드 가능한 최대 용량을 초과했습니다."
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonResponse<Void>> handleException(
            Exception e,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;

        log.error(
                "[전역 예외] path={}, message={}",
                request.getRequestURI(),
                e.getMessage(),
                e
        );

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(CommonResponse.fail(
                        errorCode.getCode(),
                        errorCode.getMessage()
                ));
    }
}