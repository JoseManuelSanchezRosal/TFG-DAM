package com.tuturno.dto.auth;

public record LoginRequestDTO(
        String email,
        String password
) {}