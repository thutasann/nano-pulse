package com.thutasann.nano_pulse_auth.dto.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthEvent {
    private String eventType;
    private long timestamp;
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
}
