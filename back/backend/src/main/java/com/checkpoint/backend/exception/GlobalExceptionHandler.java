package com.checkpoint.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


/**
 * Manejador de excepciones para todos los controladores
 * Spring respeta el orden al que se declaran:
 * {@link ResourceNotFoundException} - 404
 * {@link MethodArgumentNotValidException} - 400 (Validacion Bean, la manda Spring)
 * {@link IllegalArgumentException} - 400 (validación manual)
 * {@link Exception} genérica - 500
 * Todas las respuestas siguen la estructura: {@code {codigo, mensaje}}.
 */

@ControllerAdvice(basePackages = "com.checkpoint.backend.controller")
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(org.springframework.validation.FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Error de validación.");
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, mensaje));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericError(Exception e) {
        log.error("Error interno del servidor", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Error interno del servidor"));
    }

    /**
     * Estructura de respuesta de error estándar devuelta por todos los manejadores.
     */
    public static class ErrorResponse {
        private final int codigo;
        private final String mensaje;

        public ErrorResponse(int codigo, String mensaje) {
            this.codigo = codigo;
            this.mensaje = mensaje;
        }

        public int getCodigo() {
            return codigo;
        }

        public String getMensaje() {
            return mensaje;
        }
    }
}