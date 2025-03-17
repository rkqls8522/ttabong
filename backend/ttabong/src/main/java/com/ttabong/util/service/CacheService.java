package com.ttabong.util.service;

import com.ttabong.dto.user.AuthDto;

import java.util.List;

public interface CacheService {

    List<String> generatePresignedUrlsForTemplate(AuthDto authDto);

}
