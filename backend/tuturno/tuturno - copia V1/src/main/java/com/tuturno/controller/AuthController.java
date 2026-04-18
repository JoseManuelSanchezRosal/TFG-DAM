package com.tuturno.controller;

import com.tuturno.dto.auth.LoginRequestDTO;
import com.tuturno.dto.auth.LoginResponseDTO;
import com.tuturno.dto.auth.RegisterRequestDTO;
import com.tuturno.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDto) {
        return ResponseEntity
                .ok()
                .body(this.authService.login(loginRequestDto));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequestDTO registerRequestDto) {
        return ResponseEntity
                .ok()
                .body("");
    }
}