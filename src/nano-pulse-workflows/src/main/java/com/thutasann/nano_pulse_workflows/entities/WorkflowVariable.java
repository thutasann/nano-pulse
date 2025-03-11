package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;

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
@Document(collection = "workflow_variables")
@CompoundIndex(name = "tenant_key_idx", def = "{'tenantId': 1, 'key': 1}", unique = true)
public class WorkflowVariable {
    @Id
    private String id;

    @Indexed
    private String tenantId;

    @Indexed
    private String key;

    private String value;

    private VariableType type;

    private boolean isEncrypted;

    private boolean isSystem;

    private String description;

    private String createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum VariableType {
        STRING, NUMBER, BOOLEAN, JSON, SECRET
    }
}
