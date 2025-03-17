package com.ttabong.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ImageConfig extends LoggerConfig {
    MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    ImageConfig(@Value("${minio.url}") String minioUrl,
                @Value("${minio.access-key}") String accessKey,
                @Value("${minio.secret-key}") String secretKey,
                @Value("${minio.bucket-name}") String bucketName) {
        logger.info("미니오 접속 URL : " + minioUrl);
        logger.info("미니오 접속 AccessKey : " + accessKey);
        logger.info("미니오 접속 SecretKey : " + secretKey);
        logger.info("미니오 접속 BucketName : " + bucketName);
        this.minioClient = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
    }

    @Bean
    public MinioClient minioClient() {
        return this.minioClient;
    }

    @PostConstruct
    public void ensureBucketExists() {
        try {
            MinioClient client = this.minioClient;
            logger.info(" Bucket '" + bucketName + "' 관리를 시작합니다!");
            boolean found = client.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                logger.info("✅ Bucket '" + bucketName + "' created successfully!");
            } else {
                logger.info("✅ Bucket '" + bucketName + "' already exists.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
