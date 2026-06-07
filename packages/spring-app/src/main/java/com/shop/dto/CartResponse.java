package com.shop.dto;

import com.shop.model.CartItem;

import java.time.Instant;
import java.util.UUID;

public record CartResponse(
    UUID id,
    UUID productId,
    String productName,
    UUID supplierId,
    long unitPrice,
    String thumbnailUrl,
    int quantity,
    Instant createdAt
) {
    public static CartResponse from(CartItem item) {
        return new CartResponse(
            item.getId(),
            item.getProductId(),
            item.getProductName(),
            item.getSupplierId(),
            item.getUnitPrice(),
            item.getThumbnailUrl(),
            item.getQuantity(),
            item.getCreatedAt()
        );
    }
}
