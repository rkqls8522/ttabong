package com.ttabong.util.service;

import com.ttabong.dto.user.AuthDto;
import com.ttabong.util.CacheUtil;
import com.ttabong.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class CacheServiceImpl implements CacheService {

    private final CacheUtil cacheUtil;
    private final ImageUtil minioUtil;

    public List<String> generatePresignedUrlsForTemplate(AuthDto authDto) {

        if (authDto == null || authDto.getUserId() == null) {
            throw new SecurityException("로그인이 필요합니다.");
        }

        Integer tempId = cacheUtil.generatePostId().intValue();

        return IntStream.rangeClosed(1, 10)
                .mapToObj(i -> {
                    String objectPath = tempId + "_" + i + ".webp";
                    String presignedUrl = minioUtil.getPresignedUploadUrl(objectPath);

                    cacheUtil.mapTempPresignedUrlwithObjectPath(presignedUrl, objectPath); // 레디스 매핑

                    return presignedUrl;
                })
                .collect(Collectors.toList());

    }

}
