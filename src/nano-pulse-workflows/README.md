# Workflows Designer Microservice

## Entity Relationship Summary

1. Template Hierarchy :

   - WorkflowTemplate → WorkflowVersion → WorkflowExecution → StepExecution

2. Workflow Components :

   - WorkflowTemplate contains WorkflowStep and WorkflowTrigger

3. Integration Framework :

   - IntegrationDefinition contains IntegrationAction and IntegrationTrigger
   - WorkflowStep references IntegrationAction
   - WorkflowTrigger references IntegrationTrigger

4. User Connections :

   - UserIntegration connects users to IntegrationDefinition

5. Template Library :

   - WorkflowTemplateLibrary provides reusable WorkflowTemplate instances

---

## Core Entities 🚀

### WorkflowTemplate

The central entity that defines a workflow's structure and configuration.

- Purpose : Serves as the blueprint for workflow execution
- Key Fields :

  - id : Unique identifier
  - templateId : Template reference ID
  - tenantId : Organization/tenant identifier
  - triggers : List of workflow triggers
  - steps : List of workflow steps
  - status : Current state (DRAFT, PUBLISHED, ARCHIVED, DEPRECATED)
  - isActive : Whether the template is active
  - isPublic : Whether the template is publicly accessible
  - metadata : Additional configuration data
  - permissionUserIds / permissionRoleIds : Access control lists
    Relationships :

- One-to-many with WorkflowVersion
- Contains many WorkflowStep objects
- Contains many WorkflowTrigger objects

---

### WorkflowVersion

Represents a specific version of a workflow template.

- Purpose : Enables versioning of workflows for change management
- Key Fields :

  - id : Unique identifier
  - templateId : Reference to parent template
  - versionNumber : Sequential version number
  - workflowData : Complete workflow template data
  - isActive : Whether this version is currently active
  - changeDescription : Description of changes in this version
  - isRollbackVersion : Whether this is a rollback version
    Relationships :

- Many-to-one with WorkflowTemplate
- One-to-many with WorkflowExecution

---

### WorkflowExecution

Represents a single execution instance of a workflow.

- Purpose : Tracks the execution of a workflow version
- Key Fields :

  - id : Unique identifier
  - templateId : Reference to workflow template
  - versionId : Reference to specific version
  - status : Execution status (PENDING, RUNNING, COMPLETED, FAILED, etc.)
  - input / output : Input and output data
  - stepExecutions : List of step execution details
  - startedAt / completedAt : Timing information
  - executionTimeMs : Total execution time
    Relationships :

- Many-to-one with WorkflowVersion
- Contains many StepExecution objects

---

### StepExecution

Represents the execution of a single step within a workflow.

- Purpose : Tracks the execution status and data for a specific step
- Key Fields :

  - stepId : Identifier of the step
  - stepName : Name of the step
  - stepType : Type of step
  - stepStatus : Status (PENDING, RUNNING, COMPLETED, FAILED, etc.)
  - input / output : Input and output data
  - startedAt / completedAt : Timing information
  - retryCount / retryAttempt : Retry configuration
    Relationships :

- Many-to-one with WorkflowExecution
- References a WorkflowStep

---

## Workflow Components 🚀

### WorkflowStep

Defines a single step in a workflow.

- Purpose : Represents an action, condition, or other operation in a workflow
- Key Fields :

  - id : Unique identifier
  - name : Step name
  - type : Step type (ACTION, CONDITION, LOOP, DELAY, etc.)
  - integrationId : Reference to integration definition
  - integrationActionId : Reference to specific integration action
  - nextSteps : IDs of steps to execute next
  - onErrorSteps : IDs of steps to execute on error
  - condition : Conditional logic
  - inputMappings / outputMappings : Data mapping configuration
    Relationships :

- Many-to-one with WorkflowTemplate
- References IntegrationDefinition and IntegrationAction

---

### WorkflowTrigger

Defines what initiates a workflow execution.

- Purpose : Specifies the event or condition that starts a workflow
- Key Fields :

  - id : Unique identifier
  - name : Trigger name
  - type : Trigger type (WEBHOOK, SCHEDULED, EVENT, etc.)
  - integrationId : Reference to integration definition
  - integrationEventId : Reference to specific integration event
  - config : Configuration parameters
  - cronExpression : For scheduled triggers
    Relationships :

- Many-to-one with WorkflowTemplate
- References IntegrationDefinition and IntegrationTrigger

---

### WorkflowVariable

Stores variables that can be used across workflows.

- Purpose : Provides a way to store and reuse values across workflow executions
- Key Fields :
  - id : Unique identifier
  - tenantId : Organization/tenant identifier
  - key : Variable name
  - value : Variable value
  - type : Variable type (STRING, NUMBER, BOOLEAN, JSON, SECRET)
  - isEncrypted : Whether the value is encrypted
  - isSystem : Whether it's a system variable

---

## Integration Entities 🚀

### IntegrationDefinition

Defines an external system integration.

- Purpose : Represents a third-party service or system that can be integrated
- Key Fields :

  - id : Unique identifier
  - name : Integration name
  - displayName : User-friendly name
  - description : Description of the integration
  - logoUrl : URL to integration logo
  - authType : Authentication type (OAUTH2, API_KEY, etc.)
  - actions : List of available actions
  - triggers : List of available triggers

Relationships :

- Contains many IntegrationAction objects
- Contains many IntegrationTrigger objects
- Referenced by WorkflowStep and WorkflowTrigger

---

### IntegrationAction

Defines a specific action that can be performed with an integration.

- Purpose : Represents an operation that can be executed on a third-party system
- Key Fields :

  - id : Unique identifier
  - name : Action name
  - displayName : User-friendly name
  - endpoint : API endpoint
  - method : HTTP method
  - inputSchema / outputSchema : Data schemas
  - defaultConfig : Default configuration
    Relationships :

- Many-to-one with IntegrationDefinition
- Referenced by WorkflowStep

---

### IntegrationTrigger

Defines an event from an integration that can trigger a workflow.

- Purpose : Represents an event from a third-party system that can start a workflow
- Key Fields :

  - id : Unique identifier
  - name : Trigger name
  - displayName : User-friendly name
  - type : Trigger type (WEBHOOK, POLLING, EVENT)
  - inputSchema : Expected data schema
  - webhookUrl : Webhook URL (if applicable)
    Relationships :

- Many-to-one with IntegrationDefinition
- Referenced by WorkflowTrigger

---

### UserIntegration

Represents a user's connection to an integration.

- Purpose : Stores user-specific integration credentials and configuration
- Key Fields :

  - id : Unique identifier
  - userId : User identifier
  - tenantId : Organization/tenant identifier
  - integrationId : Reference to integration definition
  - credentials : Authentication credentials
  - tokenExpiresAt : Token expiration time
  - refreshToken : OAuth refresh token
  - isActive : Whether the integration is active
    Relationships :

- References IntegrationDefinition
- Associated with a user and tenant

---

## Template Library Entities 🚀

### WorkflowTemplateLibrary

Stores reusable workflow templates.

- Purpose : Provides a library of pre-built workflow templates
- Key Fields :
  - id : Unique identifier
  - name : Template name
  - description : Template description
  - category : Template category
  - templateData : Complete workflow template
  - isPublished : Whether the template is published
  - isFeatured : Whether the template is featured
  - isPremium : Whether the template is premium
  - requiredIntegrations : List of required integrations

Relationships :

- Contains a WorkflowTemplate

---
