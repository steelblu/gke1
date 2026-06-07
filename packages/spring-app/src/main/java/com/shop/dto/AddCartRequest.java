package com.shop.dto;

import java.util.UUID;

public record AddCartRequest(
    UUID productId,
    int quantity
) {}
