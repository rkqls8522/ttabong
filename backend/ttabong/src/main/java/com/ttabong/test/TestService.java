package com.ttabong.test;

import com.ttabong.config.LoggerConfig;
import com.ttabong.entity.sns.Review;
import com.ttabong.entity.user.User;
import com.ttabong.test.dto.CreatePostRequestDto;
import com.ttabong.test.dto.CreatePostResponseDto;
import com.ttabong.util.CacheUtil;
import com.ttabong.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestService extends LoggerConfig {

    private final CacheUtil cacheUtil;
    private final ImageUtil imageUtil;
    private final TestRepository testRepository;
    private final ImgTestRepository imgRepository;
    private final ImgTestRepository imgTestRepository;

    public CreatePostResponseDto startPostCache(Integer userId) throws Exception {

        //1.redis에서 게시글 임시 캐싱용 게시글 pk발급
        Integer tempId = Long.valueOf(cacheUtil.generatePostId().intValue()).intValue();
        //2.presinged url을 tempid+ 이미지 순서로 순차 발행 (10개 발급하면됨)
        List<String> presignedUrls = new ArrayList<String>();
        for (int i = 1; i <= 10; i++) {
            String objectPath = tempId + "_" + i + ".webp";
            String presignedUrl = imageUtil.getPresignedUploadUrl(objectPath);
            presignedUrls.add(presignedUrl);
            //presignedur <-key objectpath <-value로 저장
            cacheUtil.mapTempPresignedUrlwithObjectPath(presignedUrl, objectPath);
        }

        //4.필수 ResponseDto객체정보 입력(임시키, presignedUrl
        CreatePostResponseDto responseDto = CreatePostResponseDto.builder().postingId(tempId).images(presignedUrls).build();

        return responseDto;
    }

    //작동하는지 확인은 못해봄... 그러나 이런느낌으로 구현 부탁함
    public void endPost(CreatePostRequestDto requestDto) throws Exception {
        List<String> objectPaths = new ArrayList<>();

        Review review = Review.builder().id(null).parentReview(null).groupId(null).recruit(null).writer(User.builder().id(requestDto.getWriterId()).build()).title(requestDto.getContent()).content(requestDto.getContent()).createdAt(Instant.now()).imgCount(requestDto.getImages().size()).build();

        Review reviewResult = testRepository.save(review);
//        requestDto.getImages().forEach(e -> {
//            imgTestRepository.save(ReviewImage.builder().reviewId(reviewResult.getId()).imageUrl(cacheUtil.findObjectPath(e)).build());
//        });
    }

    //imgId + _ + Img넘버 하면 이미지가 찾아짐
    public String getImgUrl(String imgId) throws Exception {
        return imageUtil.getPresignedDownloadUrl(imgId + "_" + 1 + ".webp");
    }

    public void addRedisTTL(Integer time) {
        if (cacheUtil.addCompleteEventScheduler(1, time)) {
            logger.info("cache Timeout " + time);
        } else {
            logger.info("cache Timeout fail" + time);
        }
    }
}
