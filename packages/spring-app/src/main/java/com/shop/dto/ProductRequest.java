package com.shop.dto;

public record ProductRequest(
    String name,
    String description,
    Long price,
    Integer stock,
    String status,
    String category
) {}
