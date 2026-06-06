package com.shop.dto;

import com.shop.model.Product;
import java.util.UUID;

public record ProductSummary(
    UUID id,
    String name,
    long price,
    String thumbnailUrl,
    String sellerName,
    String category
) {
    public static ProductSummary from(Product p) {
        return new ProductSummary(
            p.getId(),
            p.getName(),
            p.getPrice(),
            p.getThumbnailUrl(),
            p.getSupplierName(),
            p.getCategory()
        );
    }
}
