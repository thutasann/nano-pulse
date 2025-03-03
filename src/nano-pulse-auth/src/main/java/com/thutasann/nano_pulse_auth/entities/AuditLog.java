package com.thutasann.nano_pulse_auth.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.thutasann.nano_pulse_auth.enums.AuditAction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Audit Log Entity
 */
@Document(collection = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private AuditAction action;

    private String details;
    private String ipAddress;
    private String userAgent;

    @CreatedDate
    private LocalDateTime createdAt;
}
