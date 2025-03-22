package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.thutasann.nano_pulse_workflows.entities.components.IntegrationAction;
import com.thutasann.nano_pulse_workflows.entities.components.IntegrationTrigger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "integration_definitions")
public class IntegrationDefinition {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String displayName;

    private String description;

    private String logoUrl;

    private String category;

    private String color;

    private AuthType authType;

    @Builder.Default
    private Map<String, Object> authConfig = new HashMap<>();

    @Builder.Default
    private List<IntegrationAction> actions = new ArrayList<>();

    @Builder.Default
    private List<IntegrationTrigger> triggers = new ArrayList<>();

    private String baseUrl;

    private String docsUrl;

    private String version;

    private boolean isActive;

    private boolean isPremium;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum AuthType {
        OAUTH2,
        API_KEY,
        BASIC_AUTH,
        CUSTOM,
        NONE
    }
}
