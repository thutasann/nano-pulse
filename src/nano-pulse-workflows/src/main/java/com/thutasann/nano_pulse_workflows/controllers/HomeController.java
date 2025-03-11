package com.thutasann.nano_pulse_workflows.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("${api.prefix}")
public class HomeController {

    @GetMapping
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Welcome to Nano Pulse Authentication Service...");
    }
}