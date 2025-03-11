package com.thutasann.nano_pulse_workflows.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "workflow_template_library")
public class WorkflowTemplateLibrary {
    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    private String category;

    private String icon;

    private String thumbnailUrl;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private WorkflowTemplate templateData;

    private boolean isPublished;

    private boolean isFeatured;

    private boolean isPremium;

    private Integer usageCount;

    private Double averageRating;

    private Integer ratingCount;

    @Builder.Default
    private List<String> requiredIntegrations = new ArrayList<>();

    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    private String createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
