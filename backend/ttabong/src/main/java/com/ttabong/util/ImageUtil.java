package com.ttabong.util;

import com.ttabong.exception.ImageProcessException;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class ImageUtil {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    String bucketName;

    public static String extractObjectPath(String presignedUrl) {
        if (presignedUrl == null || presignedUrl.isEmpty()) {
            return null;
        }

        try {
            // URL에서 파일명 추출 (마지막 "/" 이후 문자열)
            URI uri = new URI(presignedUrl);
            String path = uri.getPath(); // 예: "/ttabong-bucket/review-images/1-1.webp"

            // "/"로 split 후 마지막 요소 가져오기 (파일명)
            String[] segments = path.split("/");
            String filename = segments[segments.length - 1]; // "1-1.webp" 반환

            return filename.replace("-", "_");

        } catch (URISyntaxException e) {
            throw new RuntimeException("URL 파싱 오류: " + presignedUrl, e);
        }
    }

    public String getPresignedUploadUrl(String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .method(Method.PUT)
                            .expiry(60, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("MinIO Presigned Upload URL 생성 실패", e);
        }
    }

    public String getPresignedDownloadUrl(String objectName) throws Exception {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .method(Method.GET)
                            .expiry(60, TimeUnit.HOURS) // 10분 동안 유효
                            .build()
            );
        } catch (Exception e) {
            throw new ImageProcessException("Presigned URL 생성 실패: " + e.getMessage(), e);
        }
    }

    public void renameFileInMinIO(String bucketName, String oldObjectName, String newObjectName) {
        try {
            InputStream oldFile = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(oldObjectName)
                            .build()
            );

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(newObjectName)
                            .stream(oldFile, oldFile.available(), -1)
                            .contentType("image/webp")
                            .build()
            );

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(oldObjectName)
                            .build()
            );

            System.out.println("MinIO 파일명 변경 성공: " + oldObjectName + " → " + newObjectName);
        } catch (Exception e) {
            throw new RuntimeException("MinIO에서 파일명 변경 실패: " + e.getMessage(), e);
        }
    }

    public String getPresignedDeleteUrl(String objectName) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .method(Method.DELETE)
                        .expiry(60, TimeUnit.HOURS) // 10분 동안 유효
                        .build()
        );
    }

    public void deleteObject(String objectName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            System.out.println("✅ MinIO 파일 삭제 성공: " + objectName);

        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                System.out.println("⚠️ MinIO에서 해당 파일이 존재하지 않아 삭제할 수 없음: " + objectName);
            } else {
                throw new RuntimeException("MinIO에서 기존 이미지 삭제 실패: " + objectName, e);
            }
        } catch (Exception e) {
            throw new RuntimeException("MinIO에서 기존 이미지 삭제 중 알 수 없는 오류 발생: " + objectName, e);
        }
    }


    public void validateTest() {
    }
}
