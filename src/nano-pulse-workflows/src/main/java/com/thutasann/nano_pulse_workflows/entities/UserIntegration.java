package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_integrations")
@CompoundIndex(name = "user_integration_idx", def = "{'userId': 1, 'integrationId': 1}", unique = true)
public class UserIntegration {
    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String tenantId;

    @Indexed
    private String integrationId;

    private String integrationName;

    private String displayName;

    @Builder.Default
    private Map<String, Object> credentials = new HashMap<>();

    private LocalDateTime tokenExpiresAt;

    private String refreshToken;

    private boolean isActive;

    private LocalDateTime lastUsedAt;

    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
