package com.thutasann.nano_pulse_workflows.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.thutasann.nano_pulse_workflows.entities.UserIntegration;

@Repository
public interface UserIntegrationRepository extends MongoRepository<UserIntegration, String> {
    List<UserIntegration> findByUserId(String userId);

    List<UserIntegration> findByTenantId(String tenantId);

    List<UserIntegration> findByIntegrationId(String integrationId);

    List<UserIntegration> findByUserIdAndIsActive(String userId, boolean isActive);

    List<UserIntegration> findByTenantIdAndIsActive(String tenantId, boolean isActive);

    @Query("{'tokenExpiresAt': {$lt: ?0}}")
    List<UserIntegration> findExpiredTokens(LocalDateTime now);

    @Query("{'lastUsedAt': {$lt: ?0}}")
    List<UserIntegration> findInactiveIntegrations(LocalDateTime cutoffDate);

    long countByTenantId(String tenantId);

    long countByIntegrationId(String integrationId);

}
