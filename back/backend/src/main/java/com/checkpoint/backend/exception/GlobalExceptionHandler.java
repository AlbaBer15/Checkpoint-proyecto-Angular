package com.checkpoint.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Manejo centralizado de excepciones.
 * Convierte IllegalArgumentException (validaciones) en respuestas JSON claras.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(IllegalArgumentException e) {
        // ✅ Si hay error de validación en backend, respond 400 con mensaje
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericError(Exception e) {
        // ✅ Cualquier otra excepción: 500 con mensaje genérico
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Error interno del servidor"));
    }

    /**
     * Clase DTO para respuestas de error consistentes.
     * Angular lo parsea como JSON estructurado.
     */
    public static class ErrorResponse {
        public int codigo;
        public String mensaje;

        public ErrorResponse(int codigo, String mensaje) {
            this.codigo = codigo;
            this.mensaje = mensaje;
        }

        // Getters para Jackson
        public int getCodigo() { return codigo; }
        public String getMensaje() { return mensaje; }
    }
}
