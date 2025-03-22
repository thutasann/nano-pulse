package com.thutasann.nano_pulse_workflows.requests;

import java.util.List;
import java.util.Map;

import com.thutasann.nano_pulse_workflows.entities.WorkflowTemplate;
import com.thutasann.nano_pulse_workflows.entities.components.WorkflowStep;
import com.thutasann.nano_pulse_workflows.entities.components.WorkflowTrigger;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkflowTemplateRequest {
    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    private String description;

    @NotNull(message = "At least one trigger is required")
    private List<WorkflowTrigger> triggers;

    @NotNull(message = "At least one step is required")
    private List<WorkflowStep> steps;

    private Map<String, Object> metadata;

    private String category;

    private String icon;

    private String color;

    public WorkflowTemplate toWorkflowTemplate() {
        return WorkflowTemplate.builder()
                .tenantId(tenantId)
                .triggers(triggers)
                .steps(steps)
                .metadata(metadata)
                .category(category)
                .icon(icon)
                .color(color)
                .build();
    }
}
