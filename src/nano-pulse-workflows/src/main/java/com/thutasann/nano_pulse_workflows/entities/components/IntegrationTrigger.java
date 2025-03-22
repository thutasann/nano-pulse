package com.thutasann.nano_pulse_workflows.entities.components;

import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationTrigger {
    private String id;

    private String name;

    private String displayName;

    private String description;

    private TriggerType type;

    @Builder.Default
    private Map<String, Object> inputSchema = new HashMap<>();

    @Builder.Default
    private Map<String, Object> outputSchema = new HashMap<>();

    private String webhookUrl;

    @Builder.Default
    private Map<String, Object> defaultConfig = new HashMap<>();

    private boolean isActive;

    private String category;

    private String icon;

    public enum TriggerType {
        WEBHOOK, POLLING, EVENT
    }
}
