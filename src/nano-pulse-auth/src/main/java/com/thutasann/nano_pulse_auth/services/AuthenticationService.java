package com.thutasann.nano_pulse_auth.services;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thutasann.nano_pulse_auth.entities.User;
import com.thutasann.nano_pulse_auth.enums.Role;
import com.thutasann.nano_pulse_auth.libraries.JwtService;
import com.thutasann.nano_pulse_auth.repositories.TokenRepository;
import com.thutasann.nano_pulse_auth.repositories.UserRepository;
import com.thutasann.nano_pulse_auth.request.RegisterRequest;
import com.thutasann.nano_pulse_auth.response.AuthResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
        }

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .accountNonLocked(true)
                .failedAttempts(0)
                .createdAt(LocalDateTime.now())
                .build();

        var savedUser = userRepository.save(user);
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefereshToken(user);

        return null;
    }

    private void saveUserToken(User user, String jwtToken) {
    }
}
