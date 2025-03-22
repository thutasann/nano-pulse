package com.thutasann.nano_pulse_workflows.exceptions;

/**
 * Resource Not Found Exception
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
