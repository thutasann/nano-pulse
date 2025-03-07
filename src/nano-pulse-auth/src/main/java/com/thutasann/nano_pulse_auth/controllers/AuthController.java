package com.thutasann.nano_pulse_auth.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thutasann.nano_pulse_auth.request.LoginRequest;
import com.thutasann.nano_pulse_auth.request.RegisterRequest;
import com.thutasann.nano_pulse_auth.response.AuthResponse;
import com.thutasann.nano_pulse_auth.services.AuthenticationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("${api.prefix}/auth")
public class AuthController {
    @Autowired
    private AuthenticationService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
