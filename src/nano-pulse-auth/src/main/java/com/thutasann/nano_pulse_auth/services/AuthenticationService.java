package com.thutasann.nano_pulse_auth.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thutasann.nano_pulse_auth.entities.Token;
import com.thutasann.nano_pulse_auth.entities.User;
import com.thutasann.nano_pulse_auth.enums.Role;
import com.thutasann.nano_pulse_auth.enums.TokenType;
import com.thutasann.nano_pulse_auth.exceptions.UserAlreadyExistsException;
import com.thutasann.nano_pulse_auth.libraries.JwtService;
import com.thutasann.nano_pulse_auth.repositories.TokenRepository;
import com.thutasann.nano_pulse_auth.repositories.UserRepository;
import com.thutasann.nano_pulse_auth.request.LoginRequest;
import com.thutasann.nano_pulse_auth.request.RegisterRequest;
import com.thutasann.nano_pulse_auth.response.AuthResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
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
        saveUserToken(savedUser, accessToken);

        return AuthResponse.builder()
                .userId(user.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            handleFailedLogin(loginRequest.getEmail());
            throw e;
        }

        var user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedAttempts(0);
        userRepository.save(user);

        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefereshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);

        return AuthResponse.builder()
                .userId(user.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .userId(user.getId())
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokensByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    private void handleFailedLogin(String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        user.setFailedAttempts(user.getFailedAttempts() + 1);

        if (user.getFailedAttempts() >= 5) {
            user.setAccountNonLocked(false);
            user.setLockTime(LocalDateTime.now());
        }

        userRepository.save(user);
    }

}
