package com.shop.dto;

public record UploadUrlResponse(
    String uploadUrl,
    String objectPath,
    String publicUrl
) {}
