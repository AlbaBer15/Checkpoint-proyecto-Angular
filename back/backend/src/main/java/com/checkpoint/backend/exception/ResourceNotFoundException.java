package com.checkpoint.backend.exception;

/** Se lanza cuando no se encuentra un perfil, misión o logro por su ID. Se mapea a HTTP 404. */

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
