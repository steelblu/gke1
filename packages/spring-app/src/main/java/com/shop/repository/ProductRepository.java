package com.shop.repository;

import com.shop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByStatusOrderByCreatedAtDesc(String status);

    List<Product> findBySupplierIdOrderByCreatedAtDesc(UUID supplierId);

    List<Product> findByCategoryAndStatus(String category, String status);

    long countByStatus(String status);
}
