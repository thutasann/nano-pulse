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
public class StepExecution {
    private String stepId;

    private String stepName;

    private String stepType;

    private StepStatus stepStatus;

    @Builder.Default
    private Map<String, Object> input = new HashMap<>();

    @Builder.Default
    private Map<String, Object> output = new HashMap<>();

    private String error;

    private String errorDetails;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Long executionTimeMs;

    private Integer retryCount;

    private Integer retryAttempt;

    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    public enum StepStatus {
        PENDING, RUNNING, COMPLETED, FAILED, SKIPPED, CANCELLED
    }
}
