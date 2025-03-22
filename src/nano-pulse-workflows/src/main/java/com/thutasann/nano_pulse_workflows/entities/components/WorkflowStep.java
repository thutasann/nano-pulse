package com.thutasann.nano_pulse_workflows.entities.components;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStep {
    private String id;

    private String name;

    private StepType type;

    private String integrationId;

    private String integrationActionId;

    @Builder.Default
    private Map<String, Object> config = new HashMap<>();

    @Builder.Default
    private List<String> nextSteps = new ArrayList<>();

    @Builder.Default
    private List<String> onErrorSteps = new ArrayList<>();

    private Integer position;

    @Builder.Default
    private Map<String, Object> inputMappings = new HashMap<>();

    @Builder.Default
    private Map<String, Object> outputMappings = new HashMap<>();

    private Integer retryCount;

    private Integer retryDelaySeconds;

    private String condition;

    private Integer timeoutSeconds;

    @Builder.Default
    private Map<String, Object> inputSchema = new HashMap<>();

    @Builder.Default
    private Map<String, Object> outputSchema = new HashMap<>();

    public enum StepType {
        ACTION, CONDITION, LOOP, DELAY, TRANSFORM, NOTIFICATION, CUSTOM
    }

}
