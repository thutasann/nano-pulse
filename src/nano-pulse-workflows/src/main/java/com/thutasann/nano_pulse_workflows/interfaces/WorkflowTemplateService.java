package com.thutasann.nano_pulse_workflows.interfaces;

import java.util.List;
import java.util.Optional;

import com.thutasann.nano_pulse_workflows.entities.WorkflowTemplate;
import com.thutasann.nano_pulse_workflows.entities.WorkflowVersion;

/**
 * Service for managing workflow templates
 */
public interface WorkflowTemplateService {
    /**
     * Create a new workflow template
     * 
     * @param workflowTemplate The template to create
     * @param userId           The user id of the user who created the template
     * @return The created template
     */
    WorkflowTemplate createWorkflowTemplate(WorkflowTemplate workflowTemplate, String userId);

    /**
     * Get a workflow template by id
     *
     * @param id The id of the template to get
     * @return The template if it exists
     */
    Optional<WorkflowTemplate> getWorkflowTemplateById(String id);

    /**
     * Get all workflow templates by Tenant Id
     *
     * @param tenantId The tenant id of the templates to get
     * @return
     */
    List<WorkflowTemplate> getWorkflowTemplatesByTenantId(String tenantId);

    /**
     * Update a workflow template
     *
     * @param id                The id of the template to update
     * @param workflowTemplate  The template to update
     * @param userId            The user id of the user who updated the template
     * @param changeDescription The description of the change
     * @return The updated template
     */
    WorkflowVersion updateWorkflowTemplate(String id, WorkflowTemplate workflowTemplate, String userId,
            String changeDescription);

    /**
     * Activate or Deactivate a workflow template
     * 
     * @param id     The id of the template to update
     * @param active whether to active or deactivate the template
     * @return
     */
    WorkflowTemplate setWorkflowTemplateActive(String id, boolean active);

    /**
     * Delete a workflow template
     *
     * @param id The id of the template to delete
     */
    void deleteWorkflowTemplate(String id);

    /**
     * Clone a workflow template
     *
     * @param id      The id of the template to clone
     * @param newName The name of the cloned template
     * @param userId  The user id of the user who cloned the template
     * @return The cloned template
     */
    WorkflowTemplate cloneWorkflowTemplate(String id, String newName, String userId);

    /**
     * Validate a workflow template
     *
     * @param workflowTemplate The template to validate
     * @return A list of errors if the template is invalid
     */
    List<String> validateWorkflowTemplate(WorkflowTemplate workflowTemplate);

    /**
     * Export Workflow Template
     * 
     * @param id
     * @return
     */
    String exportWorkflowTemplate(String id);

    /**
     * Import a workflow template from JSON
     * 
     * @param json     JSON string of the template
     * @param userId   User performing the import
     * @param tenantId Tenant ID for the imported template
     * @return The imported template
     */
    WorkflowTemplate importWorkflowTemplate(String json, String userId, String tenantId);
}
