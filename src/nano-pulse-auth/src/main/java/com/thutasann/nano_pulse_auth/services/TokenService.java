package com.thutasann.nano_pulse_auth.services;

import com.thutasann.nano_pulse_auth.entities.Token;
import com.thutasann.nano_pulse_auth.repositories.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;

    public void saveToken(Token token) {
        tokenRepository.save(token);
    }

    public void revokeToken(String token) {
        var storedToken = tokenRepository.findByToken(token);
        storedToken.ifPresent(t -> {
            t.setRevoked(true);
            t.setExpired(true);
            tokenRepository.save(t);
        });
    }

    public boolean isTokenValid(String token) {
        return tokenRepository.findByToken(token)
                .map(t -> !t.isExpired() && !t.isRevoked())
                .orElse(false);
    }
}