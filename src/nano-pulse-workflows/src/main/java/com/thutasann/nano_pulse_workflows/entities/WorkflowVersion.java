package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
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
@Document(collection = "workflow_versions")
@CompoundIndex(name = "template_version_idx", def = "{'templateId': 1, 'versionNumber': 1}", unique = true)
public class WorkflowVersion {
    @Id
    private String id;

    @Indexed
    private String templateId;

    private Integer versionNumber;

    private String createdBy;

    private String changeDescription;

    private WorkflowTemplate workflowData;

    private boolean isActive;

    @CreatedDate
    private LocalDateTime createdAt;

    private boolean isRollbackVersion;

    private String rollbackReason;
}
