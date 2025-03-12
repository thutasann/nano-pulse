package com.thutasann.nano_pulse_workflows.repositories;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_workflows.entities.WorkflowExecution;

@Repository
public interface WorkflowExecutionRepository extends MongoRepository<WorkflowExecution, String> {
    List<WorkflowExecution> findByTemplateId(String templateId);

    List<WorkflowExecution> findByTemplateId(String templateId, Pageable pageable);

    List<WorkflowExecution> findByTenantId(String tenantId);

    List<WorkflowExecution> findByTenantId(String tenantId, Pageable pageable);

}
