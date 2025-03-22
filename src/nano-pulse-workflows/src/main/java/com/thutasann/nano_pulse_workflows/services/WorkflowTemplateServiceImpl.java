package com.thutasann.nano_pulse_workflows.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.thutasann.nano_pulse_workflows.entities.WorkflowTemplate;
import com.thutasann.nano_pulse_workflows.entities.WorkflowVersion;
import com.thutasann.nano_pulse_workflows.exceptions.ResourceNotFoundException;
import com.thutasann.nano_pulse_workflows.exceptions.ValidationException;
import com.thutasann.nano_pulse_workflows.interfaces.WorkflowTemplateService;
import com.thutasann.nano_pulse_workflows.repositories.WorkflowTemplateRepository;
import com.thutasann.nano_pulse_workflows.repositories.WorkflowVersionRepository;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class WorkflowTemplateServiceImpl implements WorkflowTemplateService {

    @Autowired
    private WorkflowTemplateRepository workflowTemplateRepository;
    @Autowired
    private WorkflowVersionRepository workflowVersionRepository;
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public WorkflowTemplate createWorkflowTemplate(WorkflowTemplate workflowTemplate, String userId) {
        List<String> validationErrors = validateWorkflowTemplate(workflowTemplate);
        if (!validationErrors.isEmpty()) {
            throw new ValidationException("Invalid Workflow Template " + String.join(", ", validationErrors));
        }

        workflowTemplate.setId(UUID.randomUUID().toString());
        workflowTemplate.setTemplateId(UUID.randomUUID().toString());
        workflowTemplate.setCreatedBy(userId);
        workflowTemplate.setCreatedAt(LocalDateTime.now());
        workflowTemplate.setUpdatedAt(LocalDateTime.now());
        workflowTemplate.setVersion(0L);
        workflowTemplate.setExecutionCount(0L);
        WorkflowTemplate savedTemplate = workflowTemplateRepository.save(workflowTemplate);

        WorkflowVersion workflowVersion = WorkflowVersion.builder()
                .id(UUID.randomUUID().toString())
                .templateId(savedTemplate.getId())
                .versionNumber(1)
                .createdBy(userId)
                .workflowData(savedTemplate)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .changeDescription("Initial version")
                .build();
        workflowVersionRepository.save(workflowVersion);

        return savedTemplate;
    }

    @Override
    public Optional<WorkflowTemplate> getWorkflowTemplateById(String id) {
        return workflowTemplateRepository.findById(id);
    }

    @Override
    public List<WorkflowTemplate> getWorkflowTemplatesByTenantId(String tenantId) {
        return workflowTemplateRepository.findByTenantId(tenantId);
    }

    @Override
    public WorkflowVersion updateWorkflowTemplate(String id, WorkflowTemplate workflowTemplate, String userId,
            String changeDescription) {

        WorkflowTemplate existingTemplate = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow template not found with this Id : " + id));

        List<String> validationErrors = validateWorkflowTemplate(workflowTemplate);
        if (!validationErrors.isEmpty()) {
            throw new ValidationException("Invalid Workflow Template " + String.join(", ", validationErrors));
        }

        workflowTemplate.setId(existingTemplate.getId());
        workflowTemplate.setTemplateId(existingTemplate.getTemplateId());
        workflowTemplate.setCreatedBy(existingTemplate.getCreatedBy());
        workflowTemplate.setCreatedAt(existingTemplate.getCreatedAt());
        workflowTemplate.setUpdatedAt(LocalDateTime.now());
        workflowTemplate.setVersion(existingTemplate.getVersion() + 1);
        workflowTemplate.setExecutionCount(existingTemplate.getExecutionCount());

        WorkflowTemplate updatedTemplate = workflowTemplateRepository.save(workflowTemplate);

        Integer latestVersionNumber = workflowVersionRepository.findTopByTemplateIdOrderByVersionNumberDesc(id)
                .map(WorkflowVersion::getVersionNumber).orElse(0);

        WorkflowVersion newVersion = WorkflowVersion.builder()
                .id(UUID.randomUUID().toString())
                .templateId(updatedTemplate.getId())
                .versionNumber(latestVersionNumber + 1)
                .createdBy(userId)
                .workflowData(updatedTemplate)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .changeDescription(changeDescription)
                .build();

        workflowVersionRepository.deactivatePreviousVersions(id);

        return workflowVersionRepository.save(newVersion);
    }

    @Override
    public WorkflowTemplate setWorkflowTemplateActive(String id, boolean active) {
        WorkflowTemplate template = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow template not found with this Id : " + id));

        template.setActive(active);
        template.setUpdatedAt(LocalDateTime.now());
        return workflowTemplateRepository.save(template);
    }

    @Override
    public void deleteWorkflowTemplate(String id) {
        WorkflowTemplate template = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow template not found with id: " + id));

        template.setActive(false);
        template.setUpdatedAt(LocalDateTime.now());

        workflowTemplateRepository.save(template);
    }

    @Override
    public WorkflowTemplate cloneWorkflowTemplate(String id, String newName, String userId) {

        WorkflowTemplate template = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow template not found with id: " + id));

        WorkflowTemplate clonedTemplate;
        try {
            String json = objectMapper.writeValueAsString(template);
            clonedTemplate = objectMapper.readValue(json, WorkflowTemplate.class);
        } catch (Exception e) {
            throw new RuntimeException("Error cloning workflow template", e);
        }

        clonedTemplate.setId(UUID.randomUUID().toString());
        clonedTemplate.setTemplateId(UUID.randomUUID().toString());
        clonedTemplate.setCreatedBy(userId);
        clonedTemplate.setCreatedAt(LocalDateTime.now());
        clonedTemplate.setUpdatedAt(LocalDateTime.now());
        clonedTemplate.setVersion(0L);
        clonedTemplate.setExecutionCount(0L);
        WorkflowTemplate savedClone = workflowTemplateRepository.save(clonedTemplate);

        WorkflowVersion initialVersion = WorkflowVersion.builder()
                .id(UUID.randomUUID().toString())
                .templateId(savedClone.getId())
                .versionNumber(1)
                .createdBy(userId)
                .workflowData(savedClone)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .changeDescription("Cloned from template " + id)
                .build();

        workflowVersionRepository.save(initialVersion);
        return savedClone;
    }

    @Override
    public List<String> validateWorkflowTemplate(WorkflowTemplate workflowTemplate) {
        List<String> errors = new ArrayList<>();

        if (workflowTemplate.getTenantId() == null || workflowTemplate.getTenantId().isEmpty()) {
            errors.add("Tenant ID is required");
        }

        if (workflowTemplate.getTriggers() == null || workflowTemplate.getTriggers().isEmpty()) {
            errors.add("At least one trigger is required");
        } else {
            workflowTemplate.getTriggers().forEach(trigger -> {
                if (trigger.getName() == null || trigger.getName().isEmpty()) {
                    errors.add("Trigger name is required");
                }
                if (trigger.getType() == null) {
                    errors.add("Trigger type is required");
                }
            });
        }

        if (workflowTemplate.getSteps() == null || workflowTemplate.getSteps().isEmpty()) {
            errors.add("At least one step is required");
        } else {
            workflowTemplate.getSteps().forEach(step -> {
                if (step.getName() == null || step.getName().isEmpty()) {
                    errors.add("Step name is required");
                }
                if (step.getType() == null) {
                    errors.add("Step type is required");
                }
            });
        }

        return errors;
    }

    @Override
    public String exportWorkflowTemplate(String id) {
        WorkflowTemplate template = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow template not found with id: " + id));

        try {
            return objectMapper.writeValueAsString(template);
        } catch (Exception e) {
            throw new RuntimeException("Error exporting workflow template", e);
        }

    }

    @Override
    public WorkflowTemplate importWorkflowTemplate(String json, String userId, String tenantId) {
        try {
            WorkflowTemplate importedTemplate = objectMapper.readValue(json, WorkflowTemplate.class);

            importedTemplate.setId(UUID.randomUUID().toString());
            importedTemplate.setTemplateId(UUID.randomUUID().toString());
            importedTemplate.setTenantId(tenantId);
            importedTemplate.setCreatedBy(userId);
            importedTemplate.setCreatedAt(LocalDateTime.now());
            importedTemplate.setUpdatedAt(LocalDateTime.now());
            importedTemplate.setVersion(0L);
            importedTemplate.setExecutionCount(0L);

            WorkflowTemplate savedTemplate = workflowTemplateRepository.save(importedTemplate);

            WorkflowVersion initialVersion = WorkflowVersion.builder()
                    .id(UUID.randomUUID().toString())
                    .templateId(savedTemplate.getId())
                    .versionNumber(1)
                    .createdBy(userId)
                    .workflowData(savedTemplate)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .changeDescription("Imported template")
                    .build();

            workflowVersionRepository.save(initialVersion);

            return savedTemplate;
        } catch (Exception e) {
            throw new RuntimeException("Error importing workflow template", e);
        }
    }

}
