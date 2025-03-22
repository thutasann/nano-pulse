package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
@Document(collection = "workflow_executions")
@CompoundIndex(name = "template_status_idx", def = "{'templateId': 1, 'status': 1}")
public class WorkflowExecution {
    @Id
    private String id;

    @Indexed
    private String templateId;

    private String versionId;

    private Integer versionNumber;

    @Indexed
    private String tenantId;

    private String triggerId;

    private String triggerType;

    @Indexed
    private ExecutionStatus status;

    @Builder.Default
    private Map<String, Object> input = new HashMap<>();

    @Builder.Default
    private Map<String, Object> output = new HashMap<>();

    @Builder.Default
    private List<StepExecution> stepExecutions = new ArrayList<>();

    private String error;

    private String errorDetails;

    @CreatedDate
    private LocalDateTime startedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    private Long executionTimeMs;

    @Indexed
    private String initiatedBy;

    private String correlationId;

    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    public enum ExecutionStatus {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED,
        TIMED_OUT
    }

}
