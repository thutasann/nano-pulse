package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;
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
public class WorkflowTrigger {
    private String id;

    private String name;

    private TriggerType type;

    private String integrationId;

    private String integrationEventId;

    @Builder.Default
    private Map<String, Object> config = new HashMap<>();

    private String cronExpression;

    private LocalDateTime nextExecutionTime;

    private boolean isActive;

    @Builder.Default
    private Map<String, Object> inputSchema = new HashMap<>();

    @Builder.Default
    private Map<String, Object> outputSchema = new HashMap<>();

    public enum TriggerType {
        WEBHOOK,
        SCHEDULED,
        EVENT,
        INTEGRATION,
        MANUAL
    }
}
