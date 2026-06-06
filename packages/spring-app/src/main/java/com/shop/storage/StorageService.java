package com.shop.storage;

import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class StorageService {

    private final Storage storage;
    private final String projectId;
    private final String publicBucket;
    private final String privateBucket;

    public StorageService(
            Storage storage,
            @Value("${gcp.storage.project-id}") String projectId,
            @Value("${gcp.storage.public-bucket}") String publicBucket,
            @Value("${gcp.storage.private-bucket}") String privateBucket) {
        this.storage = storage;
        this.projectId = projectId;
        this.publicBucket = publicBucket;
        this.privateBucket = privateBucket;
    }

    public String getProjectId() {
        return projectId;
    }

    public String getPublicBucket() {
        return publicBucket;
    }

    public String getPrivateBucket() {
        return privateBucket;
    }

    private String bucketName(BucketType type) {
        return switch (type) {
            case PUBLIC -> publicBucket;
            case PRIVATE -> privateBucket;
        };
    }

    /**
     * Upload용 Signed URL 발급 (public/private 공통).
     * PUT method, 지정된 content-type 허용.
     */
    public URL generateUploadSignedUrl(BucketType bucketType, String objectPath, String contentType) {
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName(bucketType), objectPath).build();

        return storage.signUrl(
                blobInfo,
                15, TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
                Storage.SignUrlOption.withExtHeaders(Map.of("Content-Type", contentType))
        );
    }

    /**
     * Download용 Signed URL 발급 (private bucket 전용).
     * GET method, 기본 TTL 5분.
     */
    public URL generateReadSignedUrl(BucketType bucketType, String objectPath) {
        if (bucketType == BucketType.PUBLIC) {
            throw new IllegalArgumentException("Public bucket does not need signed URL for read. Use getPublicUrl() instead.");
        }

        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName(bucketType), objectPath).build();

        return storage.signUrl(
                blobInfo,
                5, TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.GET)
        );
    }

    /**
     * Public bucket 객체의 직접 URL 반환 (CDN origin).
     */
    public String getPublicUrl(String objectPath) {
        return String.format("https://storage.googleapis.com/%s/%s", publicBucket, objectPath);
    }

    /**
     * GCS에서 객체 삭제.
     */
    public boolean deleteObject(BucketType bucketType, String objectPath) {
        return storage.delete(
                BlobId.of(bucketName(bucketType), objectPath)
        );
    }

    /**
     * 객체 존재 여부 확인.
     */
    public boolean objectExists(BucketType bucketType, String objectPath) {
        Blob blob = storage.get(BlobId.of(bucketName(bucketType), objectPath));
        return blob != null && blob.exists();
    }
}
