package com.thutasann.nano_pulse_workflows.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_workflows.entities.WorkflowExecution;
import com.thutasann.nano_pulse_workflows.entities.WorkflowExecution.ExecutionStatus;

@Repository
public interface WorkflowExecutionRepository extends MongoRepository<WorkflowExecution, String> {
    List<WorkflowExecution> findByTemplateId(String templateId);

    List<WorkflowExecution> findByTemplateId(String templateId, Pageable pageable);

    List<WorkflowExecution> findByTenantId(String tenantId);

    List<WorkflowExecution> findByTenantId(String tenantId, Pageable pageable);

    List<WorkflowExecution> findByTenantIdAndStatus(String templateId, ExecutionStatus status);

    List<WorkflowExecution> findByTemplateIdAndStatus(String templateId, ExecutionStatus status);

    @Query("{'tenantId': ?0, 'startedAt': {$gte: ?1, $lte: ?2}}")
    List<WorkflowExecution> findByTenantIdAndTimeRange(String tenantId, LocalDateTime start, LocalDateTime end);

    @Query("{'templateId': ?0, 'startedAt': {$gte: ?1, $lte: ?2}}")
    List<WorkflowExecution> findByTemplateIdAndTimeRange(String templateId, LocalDateTime start, LocalDateTime end);

    @Query("{'tenantId': ?0, 'status': ?1, 'startedAt': {$gte: ?2, $lte: ?3}}")
    List<WorkflowExecution> findByTenantIdAndStatusAndTimeRange(String tenantId, ExecutionStatus status,
            LocalDateTime start, LocalDateTime end);

    long countByTenantId(String tenantId);

    long countByTemplateId(String templateId);

    long countByTenantIdAndStatus(String tenantId, ExecutionStatus status);

    long countByTemplateIdAndStatus(String templateId, ExecutionStatus status);
}
