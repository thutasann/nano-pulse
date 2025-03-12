package com.thutasann.nano_pulse_workflows.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_workflows.entities.WorkflowTemplate;
import com.thutasann.nano_pulse_workflows.entities.WorkflowTemplate.WorkflowStatus;

@Repository
public interface WorkflowTemplateRepository extends MongoRepository<WorkflowTemplate, String> {
    List<WorkflowTemplate> findByTenantId(String tenantId);

    Page<WorkflowTemplate> findByTenantId(String tenantId, Pageable pageable);

    Optional<WorkflowTemplate> findByTenantIdAndName(String tenantId, String name);

    List<WorkflowTemplate> findByTenantIdAndIsActive(String tenantId, boolean isActive);

    List<WorkflowTemplate> findByTenantIdAndStatus(String tenantId, WorkflowStatus status);

    @Query("{'tenantId': ?0, 'tags': { $in: ?1 }}")
    List<WorkflowTemplate> findByTenantIdAndTags(String tenantId, List<String> tags);

    @Query("{'tenantId': ?0, 'permissionUserIds': { $in: ?1 }}")
    List<WorkflowTemplate> findByTenantIdAndPermissionUserIds(String tenantId, List<String> userIds);

    @Query("{'tenantId': ?0, 'permissionRoleIds': { $in: ?1 }}")
    List<WorkflowTemplate> findByTenantIdAndPermissionRoleIds(String tenantId, List<String> roleIds);

    @Query("{'tenantId': ?0 'name': { $regex: ?1, $options: 'i' }}")
    List<WorkflowTemplate> searchByTenantIdAndName(String tenantId, String namePattern);

    long countByTenantId(String tenantId);

    long countByTenantIdAndStatus(String tenantId, WorkflowStatus status);
}
