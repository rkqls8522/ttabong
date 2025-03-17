package com.ttabong.dto.sns.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentCreateAndUpdateResponseDto {
    private Integer commentId;
    private Integer reviewId;
    private WriterDto writer;
    private String content;
    private LocalDateTime updatedAt;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WriterDto {
        private Integer writerId;
        private String writerName;
        private String writerProfileImage;
    }
}
