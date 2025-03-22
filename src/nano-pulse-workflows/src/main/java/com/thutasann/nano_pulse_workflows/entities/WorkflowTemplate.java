package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.thutasann.nano_pulse_workflows.entities.components.WorkflowStep;
import com.thutasann.nano_pulse_workflows.entities.components.WorkflowTrigger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "workflow_templates")
@CompoundIndex(name = "tenant_name_idx", def = "{'tenantId': 1, 'name': 1}", unique = true)
public class WorkflowTemplate {
    @Id
    private String id;

    @Indexed
    private String templateId;

    private Integer versionNUmInteger;

    @Indexed
    private String tenantId;

    @Indexed
    private String createdBy;

    private boolean isActive;

    private boolean isPublic;

    @Builder.Default
    private List<WorkflowTrigger> triggers = new ArrayList<>();

    @Builder.Default
    private List<WorkflowStep> steps = new ArrayList<>();

    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    private String category;

    private String icon;

    private String color;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Version
    private Long version;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastExecutedAt;

    private Long executionCount;

    private Long averageExecutionTimeMS;

    private WorkflowStatus status;

    @Builder.Default
    private List<String> permissionUserIds = new ArrayList<>();

    @Builder.Default
    private List<String> permissionRoleIds = new ArrayList<>();

    public enum WorkflowStatus {
        DRAFT, PUBLISHED, ARCHIVED, DEPRECATED
    }
}
