package com.shop.controller;

import com.shop.dto.DeleteObjectRequest;
import com.shop.dto.SignedDownloadUrlResponse;
import com.shop.dto.UploadUrlResponse;
import com.shop.model.Product;
import com.shop.repository.ProductRepository;
import com.shop.storage.BucketType;
import com.shop.storage.StorageService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/storage")
public class StorageController {

    private final StorageService storageService;
    private final ProductRepository productRepository;

    public StorageController(StorageService storageService, ProductRepository productRepository) {
        this.storageService = storageService;
        this.productRepository = productRepository;
    }

    @PostMapping("/products/{productId}/upload-url")
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ResponseEntity<?> getProductUploadUrl(
            @PathVariable UUID productId,
            @RequestBody Map<String, String> body) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId));

        String contentType = body.getOrDefault("contentType", "image/jpeg");
        String ext = switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "jpg";
        };
        String objectPath = "products/" + productId + "/image." + ext;

        try {
            String uploadUrl = storageService.generateUploadSignedUrl(BucketType.PUBLIC, objectPath, contentType).toString();
            String publicUrl = storageService.getPublicUrl(objectPath);

            product.setThumbnailUrl(objectPath);
            productRepository.save(product);

            return ResponseEntity.ok(new UploadUrlResponse(uploadUrl, objectPath, publicUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "GCS unavailable", "message", e.getMessage()));
        }
    }

    @GetMapping("/products/{productId}/image")
    public ResponseEntity<?> getProductImage(@PathVariable UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId));

        String thumbnailUrl = product.getThumbnailUrl();
        if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No image for product: " + productId);
        }

        try {
            return ResponseEntity.ok(Map.of("publicUrl", storageService.getPublicUrl(thumbnailUrl)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "GCS unavailable", "message", e.getMessage()));
        }
    }

    @PostMapping("/documents/upload-url")
    public ResponseEntity<?> getDocumentUploadUrl(@RequestBody Map<String, String> body) {
        String fileName = body.get("fileName");
        if (fileName == null || fileName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "fileName is required"));
        }
        String contentType = body.getOrDefault("contentType", "application/octet-stream");

        String objectPath = "documents/" + UUID.randomUUID() + "/" + fileName;

        try {
            String uploadUrl = storageService.generateUploadSignedUrl(BucketType.PRIVATE, objectPath, contentType).toString();
            return ResponseEntity.ok(new UploadUrlResponse(uploadUrl, objectPath, null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "GCS unavailable", "message", e.getMessage()));
        }
    }

    @PostMapping("/documents/download-url")
    public ResponseEntity<?> getDocumentDownloadUrl(@RequestBody Map<String, String> body) {
        String objectPath = body.get("objectPath");
        if (objectPath == null || objectPath.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "objectPath is required"));
        }

        try {
            String downloadUrl = storageService.generateReadSignedUrl(BucketType.PRIVATE, objectPath).toString();
            return ResponseEntity.ok(new SignedDownloadUrlResponse(downloadUrl, objectPath));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "GCS unavailable", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/objects")
    public ResponseEntity<?> deleteObject(@RequestBody DeleteObjectRequest request) {
        try {
            boolean deleted = storageService.deleteObject(request.bucketType(), request.objectPath());
            if (!deleted) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Object not found: " + request.objectPath());
            }
            return ResponseEntity.ok(Map.of("deleted", true));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "GCS unavailable", "message", e.getMessage()));
        }
    }
}
