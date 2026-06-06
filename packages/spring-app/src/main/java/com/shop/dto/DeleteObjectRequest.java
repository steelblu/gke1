package com.shop.dto;

import com.shop.storage.BucketType;

public record DeleteObjectRequest(
    BucketType bucketType,
    String objectPath
) {}
