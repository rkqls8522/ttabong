package com.ttabong.util.service;

import java.util.List;

public interface ImageService {
    List<String> uploadTemplateImages(Integer templateId, List<String> uploadedImages);
    void updateThumbnailImage(Integer entityId, boolean isTemplate);
    List<String> getImageUrls(Integer entityId, boolean isTemplate);
}

