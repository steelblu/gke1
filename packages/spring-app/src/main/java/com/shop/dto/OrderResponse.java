package com.shop.dto;

import com.shop.model.Order;

import java.time.Instant;
import java.util.UUID;

public record OrderResponse(
    UUID id,
    UUID productId,
    String productName,
    int quantity,
    long unitPrice,
    long totalAmount,
    String status,
    Instant createdAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getProductId(),
            order.getProductName(),
            order.getQuantity(),
            order.getUnitPrice(),
            order.getTotalAmount(),
            order.getStatus(),
            order.getCreatedAt()
        );
    }
}
