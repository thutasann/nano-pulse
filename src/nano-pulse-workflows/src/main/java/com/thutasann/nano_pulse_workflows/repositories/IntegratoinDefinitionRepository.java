package com.thutasann.nano_pulse_workflows.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_workflows.entities.IntegrationDefinition;
import com.thutasann.nano_pulse_workflows.entities.IntegrationDefinition.AuthType;

@Repository
public interface IntegratoinDefinitionRepository extends MongoRepository<IntegrationDefinition, String> {
    Optional<IntegrationDefinition> findByName(String name);

    List<IntegrationDefinition> findByCategory(String category);

    List<IntegrationDefinition> findByIsActive(boolean isActive);

    List<IntegrationDefinition> findByIsPremium(boolean isPremium);

    List<IntegrationDefinition> findByAuthType(AuthType authType);

    @Query("{'tags': {$in: ?0}}")
    List<IntegrationDefinition> findByTags(List<String> tags);

    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<IntegrationDefinition> searchByName(String namePattern);
}
