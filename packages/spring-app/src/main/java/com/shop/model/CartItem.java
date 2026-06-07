package com.shop.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "unit_price", nullable = false)
    private long unitPrice;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBuyerId() { return buyerId; }
    public void setBuyerId(UUID buyerId) { this.buyerId = buyerId; }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public UUID getSupplierId() { return supplierId; }
    public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }

    public long getUnitPrice() { return unitPrice; }
    public void setUnitPrice(long unitPrice) { this.unitPrice = unitPrice; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public Instant getCreatedAt() { return createdAt; }
}
