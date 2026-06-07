package com.shop.dto;

import com.shop.model.Product;
import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    String name,
    String description,
    long price,
    int stock,
    String status,
    String category,
    UUID supplierId,
    String supplierName,
    String thumbnailUrl,
    Instant createdAt,
    Instant updatedAt
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
            p.getId(), p.getName(), p.getDescription(),
            p.getPrice(), p.getStock(), p.getStatus(),
            p.getCategory(), p.getSupplierId(), p.getSupplierName(),
            p.getThumbnailUrl(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
