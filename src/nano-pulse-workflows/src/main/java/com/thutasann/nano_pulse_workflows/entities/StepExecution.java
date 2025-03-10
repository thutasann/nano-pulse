package com.thutasann.nano_pulse_workflows.entities;

import com.thutasann.nano_pulse_workflows.enums.StepStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StepExecution {
    private String stepId;

    private String stepName;

    private String stepType;

    private StepStatus stepStatus;
}
