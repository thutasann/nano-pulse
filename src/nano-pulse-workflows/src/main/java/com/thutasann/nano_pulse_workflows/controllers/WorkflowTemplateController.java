package com.thutasann.nano_pulse_workflows.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thutasann.nano_pulse_workflows.entities.WorkflowTemplate;
import com.thutasann.nano_pulse_workflows.entities.WorkflowVersion;
import com.thutasann.nano_pulse_workflows.interfaces.WorkflowTemplateService;
import com.thutasann.nano_pulse_workflows.requests.WorkflowTemplateRequest;
import com.thutasann.nano_pulse_workflows.response.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("${api.prefix}/workflow-templates")
public class WorkflowTemplateController {
    @Autowired
    private WorkflowTemplateService workflowTemplateService;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkflowTemplate>> createWorkflowTemplate(
            @Valid @RequestBody WorkflowTemplateRequest request,
            @RequestHeader("Authorization") String jwt) {

        WorkflowTemplate template = request.toWorkflowTemplate();
        String userId = "";

        WorkflowTemplate createdTemplate = workflowTemplateService.createWorkflowTemplate(template, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Workflow template created successfully",
                        createdTemplate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkflowTemplate>> getWorkflowTemplateById(
            @RequestHeader("Authorization") String jwt,
            String id) {
        return workflowTemplateService.getWorkflowTemplateById(id)
                .map(template -> ResponseEntity.ok(new ApiResponse<>(
                        true,
                        "Workflow template retrieved successfully",
                        template)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<WorkflowTemplate>>> getWorkflowTemplatesByTenant(
            @PathVariable String tenantId) {
        List<WorkflowTemplate> templates = workflowTemplateService.getWorkflowTemplatesByTenantId(tenantId);
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Workflow templates retrieved successfully",
                templates));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkflowVersion>> updateWorkflowTemplate(
            @PathVariable String id,
            @Valid @RequestBody WorkflowTemplateRequest request,
            @RequestParam String changeDescription,
            @RequestHeader("Authorization") String jwt) {

        WorkflowTemplate template = request.toWorkflowTemplate();
        String userId = "";

        WorkflowVersion updatedVersion = workflowTemplateService.updateWorkflowTemplate(
                id, template, userId, changeDescription);

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Workflow template updated successfully",
                updatedVersion));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<WorkflowTemplate>> setWorkflowTemplateActive(
            @PathVariable String id,
            @RequestParam boolean active) {

        WorkflowTemplate updatedTemplate = workflowTemplateService.setWorkflowTemplateActive(id, active);

        String message = active ? "Workflow template activated successfully"
                : "Workflow template deactivated successfully";

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                message,
                updatedTemplate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkflowTemplate(@PathVariable String id) {
        workflowTemplateService.deleteWorkflowTemplate(id);
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Workflow template deleted successfully",
                null));
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<ApiResponse<WorkflowTemplate>> cloneWorkflowTemplate(
            @PathVariable String id,
            @RequestParam String newName,
            @RequestHeader("Authorization") String jwt) {

        String userId = "";
        WorkflowTemplate clonedTemplate = workflowTemplateService.cloneWorkflowTemplate(id, newName, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Workflow template cloned successfully",
                        clonedTemplate));
    }

    @GetMapping("/{id}/validate")
    public ResponseEntity<ApiResponse<List<String>>> validateWorkflowTemplate(@PathVariable String id) {
        return workflowTemplateService.getWorkflowTemplateById(id)
                .map(template -> {
                    List<String> validationErrors = workflowTemplateService.validateWorkflowTemplate(template);
                    return ResponseEntity.ok(new ApiResponse<>(
                            true,
                            "Workflow template validation completed",
                            validationErrors));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<String> exportWorkflowTemplate(@PathVariable String id) {
        String exportedTemplate = workflowTemplateService.exportWorkflowTemplate(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .header("Content-Disposition", "attachment; filename=\"workflow-template.json\"")
                .body(exportedTemplate);
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<WorkflowTemplate>> importWorkflowTemplate(
            @RequestBody String templateJson,
            @RequestParam String tenantId,
            @RequestHeader("Authorization") String jwt) {

        String userId = "";
        WorkflowTemplate importedTemplate = workflowTemplateService.importWorkflowTemplate(
                templateJson, userId, tenantId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Workflow template imported successfully",
                        importedTemplate));
    }
}
