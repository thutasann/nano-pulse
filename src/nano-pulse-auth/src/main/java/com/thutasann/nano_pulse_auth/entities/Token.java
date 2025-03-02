package com.thutasann.nano_pulse_auth.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.thutasann.nano_pulse_auth.enums.TokenType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "tokens")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Token {
    @Id
    private String id;

    @Indexed
    private String token;

    @Builder.Default
    private TokenType tokenType = TokenType.BEARER;

    private boolean revoked;
    private boolean expired;

    @Indexed
    private String userId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String userAgent;
    private String ipAddress;
    private LocalDateTime lastUsedAt;
}
