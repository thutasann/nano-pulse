package com.thutasann.nano_pulse_auth.exceptions;

/**
 * User Already Exists Exception
 */
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
