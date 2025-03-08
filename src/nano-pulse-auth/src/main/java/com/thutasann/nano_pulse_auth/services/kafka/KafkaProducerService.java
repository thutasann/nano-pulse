package com.thutasann.nano_pulse_auth.services.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thutasann.nano_pulse_auth.dto.kafka.UserAuthEvent;
import com.thutasann.nano_pulse_auth.response.AuthResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class KafkaProducerService {

    @Value("${kafka.topic.user-auth}")
    private String userAuthTopic;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Send User Event to Kafka
     * 
     * @param eventType    - Event type
     * @param authResponse - Auth Response
     */
    public void sendUserAuthEvent(String eventType, AuthResponse authResponse) {
        try {
            UserAuthEvent event = UserAuthEvent.builder()
                    .eventType(eventType)
                    .timestamp(System.currentTimeMillis())
                    .userId(authResponse.getUserId())
                    .email(authResponse.getEmail())
                    .firstName(authResponse.getFirstName())
                    .lastName(authResponse.getLastName())
                    .build();

            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(userAuthTopic, authResponse.getUserId(), payload);
            log.info("Sent user auth event: {} for user: {}", eventType, authResponse.getEmail());
        } catch (Exception e) {
            log.info("Send user auth event : {} for user : {}", eventType, authResponse.getEmail());
        }
    }
}
