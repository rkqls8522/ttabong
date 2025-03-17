package com.ttabong.controller.sns;

import com.ttabong.config.LoggerConfig;
import com.ttabong.dto.sns.request.CommentCreateAndUpdateRequestDto;
import com.ttabong.dto.sns.response.CommentCreateAndUpdateResponseDto;
import com.ttabong.dto.sns.response.CommentDeleteResponseDto;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.service.sns.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@Slf4j
@RestController
@RequestMapping("/reviews/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    //11. 댓글 작성
    @PostMapping("/{reviewId}")
    public ResponseEntity<CommentCreateAndUpdateResponseDto> createComment(
            @AuthenticationPrincipal AuthDto authDto,
            @PathVariable(name = "reviewId") Integer reviewId,
            @RequestBody @Valid CommentCreateAndUpdateRequestDto requestDto) {
        log.info("11. 댓글 작성 <POST> \"/{reviewId}\"");
        CommentCreateAndUpdateResponseDto response = commentService.createComment(authDto, reviewId, requestDto);

        return ResponseEntity.ok(response);
    }

    // 12. 댓글 수정
    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentCreateAndUpdateResponseDto> updateComment(
            @AuthenticationPrincipal AuthDto authDto,
            @PathVariable Integer commentId,
            @RequestBody @Valid CommentCreateAndUpdateRequestDto requestDto) {
        log.info("12. 댓글 수정 <PATCH> \"/{commentId}\"");
        CommentCreateAndUpdateResponseDto response = commentService.updateComment(authDto, commentId, requestDto);

        return ResponseEntity.ok(response);
    }

    // 13. 댓글 삭제
    @PatchMapping("/{commentId}/delete")
    public ResponseEntity<CommentDeleteResponseDto> deleteComment(
            @AuthenticationPrincipal AuthDto authDto,
            @PathVariable(name = "commentId") Integer commentId) {
        log.info("13. 댓글 삭제 <PATCH> \"/{commentId}/delete\"");
        CommentDeleteResponseDto response = commentService.deleteComment(authDto, commentId);

        return ResponseEntity.ok(response);
    }

}


/*
//http://localhost:8080/api/reviews/2/comments
//http://localhost:8080/api/reviews/comments/1
//http://localhost:8080/api/reviews/comments/1/delete


댓글 _ 작성	POST	/api/reviews/{reviewId}/comments
댓글 _ 수정	PATCH	/api/reviews/comments/{commentId}
댓글 _ 삭제	PATCH	/api/reviews/comments/{commentId}/delete
후기 _ 이미지 업로드하기	PUT	{presignedUrl}


 */