package com.deliveryflow.common.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ApiErrorResponse(
    int status,
    String message,
    LocalDateTime timestamp,
    String path,
    List<FieldError> errors
) {
    public record FieldError(
        String field,
        String message
    ) {}
}
