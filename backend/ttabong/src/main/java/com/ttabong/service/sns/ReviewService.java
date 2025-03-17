package com.ttabong.service.sns;

import com.ttabong.dto.sns.request.ReviewCreateRequestDto;
import com.ttabong.dto.sns.request.ReviewEditRequestDto;
import com.ttabong.dto.sns.request.ReviewVisibilitySettingRequestDto;
import com.ttabong.dto.sns.response.*;
import com.ttabong.dto.user.AuthDto;

import java.util.List;

public interface ReviewService {

    ReviewCreateResponseDto createReview(AuthDto authDto, ReviewCreateRequestDto requestDto);

    ReviewDeleteResponseDto deleteReview(Integer reviewId, AuthDto authDto);

    ReviewEditStartResponseDto startReviewEdit(Integer reviewId, AuthDto authDto);

    ReviewEditResponseDto updateReview(Integer reviewId, ReviewEditRequestDto requestDto, AuthDto authDto);

    ReviewVisibilitySettingResponseDto updateVisibility(Integer reviewId, ReviewVisibilitySettingRequestDto requestDto, AuthDto userPrincipal);

    List<AllReviewPreviewResponseDto> readAllReviews(Integer reviewId, Integer limit);

    List<MyAllReviewPreviewResponseDto> readMyAllReviews(AuthDto authDto);

    ReviewDetailResponseDto detailReview(Integer reviewId) throws Exception;

    List<RecruitReviewResponseDto> recruitReview(Integer recruitId);

    void createReviewAfterSchedule(int i);
}
