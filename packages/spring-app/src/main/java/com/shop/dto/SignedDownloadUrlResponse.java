package com.shop.dto;

public record SignedDownloadUrlResponse(
    String downloadUrl,
    String objectPath
) {}
