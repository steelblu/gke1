package com.shop.controller;

import com.shop.dto.ProductSummary;
import com.shop.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/buyer")
public class BuyerProductController {

    private final ProductRepository productRepository;

    public BuyerProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/products")
    public List<ProductSummary> getProducts(
            @RequestParam(defaultValue = "active") String status,
            @RequestParam(required = false) String category) {

        List<com.shop.model.Product> products;

        if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryAndStatus(category, status);
        } else {
            products = productRepository.findByStatusOrderByCreatedAtDesc(status);
        }

        return products.stream()
                .map(ProductSummary::from)
                .toList();
    }

    @GetMapping("/products/{id}")
    public ProductSummary getProduct(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ProductSummary::from)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }
}
