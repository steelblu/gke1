package com.shop.repository;

import com.shop.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    Optional<CartItem> findByBuyerIdAndProductId(UUID buyerId, UUID productId);

    void deleteByBuyerId(UUID buyerId);
}
