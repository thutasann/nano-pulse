package com.thutasann.nano_pulse_auth;

import java.util.logging.Logger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NanoPulseAuthApplication {

	private static final Logger logger = Logger.getLogger(NanoPulseAuthApplication.class.getName());

	public static void main(String[] args) {
		SpringApplication.run(NanoPulseAuthApplication.class, args);
		logger.info("Nano Pulse Auth Application Started at http://localhost:8989/api/v1");
	}

}
