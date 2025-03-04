package com.thutasann.nano_pulse_auth.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_auth.entities.Token;

@Repository
public interface TokenRepository extends MongoRepository<Token, String> {

    @Query("{'userId': ?0, 'expired': false, 'revoked': false}")
    List<Token> findAllValidTokensByUser(String userId);
}
