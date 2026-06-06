package com.shop.dto;

public record DashboardStats(
    long totalProducts,
    long activeProducts,
    long totalOrders,
    long totalRevenue
) {
}
