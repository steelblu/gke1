package com.shop.controller;

import com.shop.dto.AddCartRequest;
import com.shop.dto.CartResponse;
import com.shop.dto.UpdateCartRequest;
import com.shop.model.CartItem;
import com.shop.model.Product;
import com.shop.repository.CartItemRepository;
import com.shop.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/buyer/cart")
public class BuyerCartController {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public BuyerCartController(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    private UUID currentUserId() {
        return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @GetMapping
    public List<CartResponse> getCart() {
        UUID buyerId = currentUserId();
        return cartItemRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream()
                .map(CartResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@RequestBody AddCartRequest req) {
        UUID buyerId = currentUserId();

        // Check if product already in cart → increment quantity
        var existing = cartItemRepository.findByBuyerIdAndProductId(buyerId, req.productId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + Math.max(1, req.quantity()));
            CartItem saved = cartItemRepository.save(item);
            return ResponseEntity.ok(CartResponse.from(saved));
        }

        // Look up product for price, name, supplier, thumbnail
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + req.productId()));

        CartItem item = new CartItem();
        item.setBuyerId(buyerId);
        item.setProductId(req.productId());
        item.setProductName(product.getName());
        item.setSupplierId(product.getSupplierId());
        item.setUnitPrice(product.getPrice());
        item.setThumbnailUrl(product.getThumbnailUrl());
        item.setQuantity(Math.max(1, req.quantity()));

        CartItem saved = cartItemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(CartResponse.from(saved));
    }

    @PutMapping("/{id}")
    public CartResponse updateQuantity(@PathVariable UUID id, @RequestBody UpdateCartRequest req) {
        UUID buyerId = currentUserId();
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + id));
        if (!item.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Access denied");
        }
        if (req.quantity() <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        item.setQuantity(req.quantity());
        return CartResponse.from(cartItemRepository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable UUID id) {
        UUID buyerId = currentUserId();
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + id));
        if (!item.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Access denied");
        }
        cartItemRepository.delete(item);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        UUID buyerId = currentUserId();
        cartItemRepository.deleteByBuyerId(buyerId);
        return ResponseEntity.noContent().build();
    }
}
