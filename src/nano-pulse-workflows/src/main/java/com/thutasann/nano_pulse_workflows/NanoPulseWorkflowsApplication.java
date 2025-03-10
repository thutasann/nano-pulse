package com.thutasann.nano_pulse_workflows;

import java.util.logging.Logger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NanoPulseWorkflowsApplication {

	private static final Logger logger = Logger.getLogger(NanoPulseWorkflowsApplication.class.getName());

	public static void main(String[] args) {
		SpringApplication.run(NanoPulseWorkflowsApplication.class, args);
		logger.info("Nano Pulse Workflows Application Started at http://localhost:6868/api/v1");
	}

}
