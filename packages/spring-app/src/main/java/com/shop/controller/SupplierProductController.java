package com.shop.controller;

import com.shop.dto.ProductRequest;
import com.shop.dto.ProductResponse;
import com.shop.model.Product;
import com.shop.model.User;
import com.shop.repository.ProductRepository;
import com.shop.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/supplier/products")
public class SupplierProductController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public SupplierProductController(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private UUID currentUserId() {
        return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
    }

    private User currentUser() {
        return userRepository.findById(currentUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<ProductResponse> listMyProducts() {
        UUID supplierId = currentUserId();
        return productRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId)
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        if (!product.getSupplierId().equals(currentUserId())) {
            throw new RuntimeException("Access denied");
        }
        return ProductResponse.from(product);
    }

    @PostMapping
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest req) {
        User user = currentUser();

        Product product = new Product();
        product.setName(req.name());
        product.setDescription(req.description());
        product.setPrice(req.price() != null ? req.price() : 0);
        product.setStock(req.stock() != null ? req.stock() : 0);
        product.setStatus(req.status() != null ? req.status() : "draft");
        product.setCategory(req.category());
        product.setSupplierId(user.getId());
        product.setSupplierName(user.getUsername());

        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.from(saved));
    }

    @PutMapping("/{id}")
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductResponse updateProduct(@PathVariable UUID id, @RequestBody ProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        if (!product.getSupplierId().equals(currentUserId())) {
            throw new RuntimeException("Access denied");
        }

        if (req.name() != null) product.setName(req.name());
        if (req.description() != null) product.setDescription(req.description());
        if (req.price() != null) product.setPrice(req.price());
        if (req.stock() != null) product.setStock(req.stock());
        if (req.status() != null) product.setStatus(req.status());
        if (req.category() != null) product.setCategory(req.category());

        Product saved = productRepository.save(product);
        return ProductResponse.from(saved);
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        if (!product.getSupplierId().equals(currentUserId())) {
            throw new RuntimeException("Access denied");
        }
        productRepository.delete(product);
        return ResponseEntity.noContent().build();
    }
}
