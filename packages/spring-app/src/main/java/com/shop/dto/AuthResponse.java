package com.shop.dto;

public record AuthResponse(
    String token,
    String userId,
    String role
) {}
