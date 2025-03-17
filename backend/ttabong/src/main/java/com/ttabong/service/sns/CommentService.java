package com.ttabong.service.sns;

import com.ttabong.dto.sns.request.CommentCreateAndUpdateRequestDto;
import com.ttabong.dto.sns.response.CommentCreateAndUpdateResponseDto;
import com.ttabong.dto.sns.response.CommentDeleteResponseDto;
import com.ttabong.dto.user.AuthDto;
import jakarta.validation.Valid;

public interface CommentService {

    CommentCreateAndUpdateResponseDto createComment(AuthDto authDto, Integer reviewId, @Valid CommentCreateAndUpdateRequestDto requestDto);

    CommentCreateAndUpdateResponseDto updateComment(AuthDto authDto, Integer commentId, @Valid CommentCreateAndUpdateRequestDto requestDto);

    CommentDeleteResponseDto deleteComment(AuthDto authDto, Integer commentId);

}
