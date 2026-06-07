package com.shop.dto;

public record RegisterRequest(
    String username,
    String password,
    String role,
    String email
) {}
