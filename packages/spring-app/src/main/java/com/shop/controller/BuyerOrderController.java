package com.shop.controller;

import com.shop.dto.OrderResponse;
import com.shop.model.CartItem;
import com.shop.model.Order;
import com.shop.repository.CartItemRepository;
import com.shop.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/buyer/orders")
public class BuyerOrderController {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;

    public BuyerOrderController(OrderRepository orderRepository, CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
    }

    private UUID currentUserId() {
        return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<List<OrderResponse>> checkout() {
        UUID buyerId = currentUserId();
        List<CartItem> cartItems = cartItemRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);

        if (cartItems.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(List.of());
        }

        List<Order> orders = new ArrayList<>();
        for (CartItem ci : cartItems) {
            Order order = new Order();
            order.setBuyerId(buyerId);
            order.setProductId(ci.getProductId());
            order.setProductName(ci.getProductName());
            order.setSupplierId(ci.getSupplierId());
            order.setQuantity(ci.getQuantity());
            order.setUnitPrice(ci.getUnitPrice());
            order.setTotalAmount(ci.getUnitPrice() * ci.getQuantity());
            order.setStatus("pending");
            orders.add(order);
        }

        List<Order> savedOrders = orderRepository.saveAll(orders);
        cartItemRepository.deleteByBuyerId(buyerId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedOrders.stream().map(OrderResponse::from).toList());
    }

    @GetMapping
    public List<OrderResponse> getOrders() {
        UUID buyerId = currentUserId();
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable UUID id) {
        UUID buyerId = currentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        if (!order.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Access denied");
        }
        return OrderResponse.from(order);
    }
}
