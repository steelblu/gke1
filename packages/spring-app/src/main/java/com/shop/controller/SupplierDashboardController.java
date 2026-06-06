package com.shop.controller;

import com.shop.dto.DashboardStats;
import com.shop.model.Order;
import com.shop.repository.OrderRepository;
import com.shop.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/supplier")
public class SupplierDashboardController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public SupplierDashboardController(ProductRepository productRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/dashboard")
    public DashboardStats getDashboard() {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByStatus("active");
        long totalOrders = orderRepository.count();
        long totalRevenue = orderRepository.findAll().stream()
                .mapToLong(Order::getTotalAmount)
                .sum();

        return new DashboardStats(totalProducts, activeProducts, totalOrders, totalRevenue);
    }

    @GetMapping("/orders")
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    @PostMapping("/orders/{id}/status")
    public Order updateOrderStatus(@PathVariable UUID id, @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
