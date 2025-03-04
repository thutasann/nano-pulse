package com.thutasann.nano_pulse_auth.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_auth.entities.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    @Query("{'email': ?0}")
    Optional<User> findByEmail(String username);
}
