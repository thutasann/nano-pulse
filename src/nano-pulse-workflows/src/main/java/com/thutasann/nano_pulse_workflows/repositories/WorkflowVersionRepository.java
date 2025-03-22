package com.thutasann.nano_pulse_workflows.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_workflows.entities.WorkflowVersion;

@Repository
public interface WorkflowVersionRepository extends MongoRepository<WorkflowVersion, String> {
    @Query(value = "{ 'templateId': ?0 }", sort = "{ 'versionNumber': -1 }")
    Optional<WorkflowVersion> findTopByTemplateIdOrderByVersionNumberDesc(String templateId);

    @Query("{ 'templateId': ?0 }")
    void deactivatePreviousVersions(String templateId);
}
