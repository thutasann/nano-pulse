package com.thutasann.nano_pulse_auth.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_auth.entities.Token;

@Repository
public interface TokenRepository extends MongoRepository<Token, String> {

    @Query("{'userId': ?0, 'expired': false, 'revoked': false}")
    List<Token> findAllValidTokensByUser(String userId);

    Optional<Token> findByToken(String token);

    @Query("{'userId': ?0}")
    List<Token> findAllByUserId(String userId);

    @Query("{'expired': true, 'revoked': false}")
    List<Token> findAllExpiredNonRevokedTokens();

    @Query("{'lastUsedAt': {$lt: ?0}}")
    List<Token> findInactiveTokens(LocalDateTime threshold);
}
