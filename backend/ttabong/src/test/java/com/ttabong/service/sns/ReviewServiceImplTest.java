package com.ttabong.service.sns;

import com.ttabong.dto.sns.request.ReviewCreateRequestDto;
import com.ttabong.dto.sns.response.ReviewCreateResponseDto;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.entity.recruit.Recruit;
import com.ttabong.entity.recruit.Template;
import com.ttabong.entity.recruit.TemplateGroup;
import com.ttabong.entity.sns.Review;
import com.ttabong.entity.user.Organization;
import com.ttabong.entity.user.User;
import com.ttabong.exception.ConflictException;
import com.ttabong.exception.NotFoundException;
import com.ttabong.repository.recruit.ApplicationRepository;
import com.ttabong.repository.recruit.RecruitRepository;
import com.ttabong.repository.sns.ReviewImageRepository;
import com.ttabong.repository.sns.ReviewRepository;
import com.ttabong.repository.user.OrganizationRepository;
import com.ttabong.repository.user.UserRepository;
import com.ttabong.util.CacheUtil;
import io.minio.MinioClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


class ReviewServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecruitRepository recruitRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ReviewImageRepository reviewImageRepository;

    @Mock
    private CacheUtil cacheUtil;

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private final AuthDto volMockAuthDto = new AuthDto(1, "volunteer");
    private final AuthDto orgMockAuthDto = new AuthDto(2, "organization");

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("후기 생성 _ 성공 케이스")
    void createReview_Success() {

        // Given
        User writer = User.builder()
                .id(1)
                .email("test@example.com")
                .build();

        Organization organization = Organization.builder()
                .id(2)
                .build();

        TemplateGroup templateGroup = TemplateGroup.builder()
                .id(1)
                .build();

        Template template = Template.builder()
                .id(1).group(templateGroup).org(organization)
                .build();

        Recruit recruit = Recruit.builder()
                .id(1).template(template)
                .build();

        ReviewCreateRequestDto requestDto = ReviewCreateRequestDto.builder()
                .recruitId(1).title("제목").content("내용").isPublic(true).uploadedImages(List.of("image1.jpg", "image2.jpg"))
                .build();

        when(userRepository.findById(volMockAuthDto.getUserId())).thenReturn(Optional.of(writer));
        when(recruitRepository.findById(requestDto.getRecruitId())).thenReturn(Optional.of(recruit));
        when(reviewRepository.existsByWriterAndRecruit(writer.getId(), recruit.getId())).thenReturn(false);
        when(applicationRepository.existsByVolunteerUserIdAndRecruitId(writer.getId(), recruit.getId())).thenReturn(true);
        when(reviewRepository.findFirstByOrgWriterAndRecruit(recruit.getId())).thenReturn(Optional.empty());
        when(cacheUtil.findObjectPath(anyString())).thenReturn("mocked/path/to/image.jpg");

        // When
        ReviewCreateResponseDto response = reviewService.createReview(volMockAuthDto, requestDto);

        // Then
        assertNotNull(response);
        assertEquals("리뷰가 생성되었습니다.", response.getMessage());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    @DisplayName("후기 생성 _ 실패 : user(작성자)가 없는 경우")
    void createReview_Fail_UserNotFound() {
        // Given
        ReviewCreateRequestDto requestDto = ReviewCreateRequestDto.builder()
                .recruitId(1)
                .title("제목")
                .content("내용")
                .isPublic(true)
                .uploadedImages(List.of("image1.jpg"))
                .build();

        when(userRepository.findById(volMockAuthDto.getUserId())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> reviewService.createReview(volMockAuthDto, requestDto));
    }

    @Test
    @DisplayName("후기 생성 _ 실패 : 모집 공고가 없는 경우")
    void createReview_Fail_RecruitNotFound() {
        // Given
        User writer = User.builder()
                .id(1)
                .email("test@example.com")
                .build();

        ReviewCreateRequestDto requestDto = ReviewCreateRequestDto.builder()
                .recruitId(1)
                .title("제목")
                .content("내용")
                .isPublic(true)
                .uploadedImages(List.of("image1.jpg"))
                .build();

        when(userRepository.findById(volMockAuthDto.getUserId())).thenReturn(Optional.of(writer));
        when(recruitRepository.findById(requestDto.getRecruitId())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> reviewService.createReview(volMockAuthDto, requestDto));
    }


    @Test
    @DisplayName("후기 생성 _ 실패 : 이미 해당 공고에 대해 리뷰를 작성한 경우")
    void createReview_Fail_AlreadyReviewed() {
        // Given
        User writer = User.builder()
                .id(1)
                .email("test@example.com")
                .build();

        Organization organization = Organization.builder()
                .id(2)
                .build();

        TemplateGroup templateGroup = TemplateGroup.builder()
                .id(1)
                .build();

        Template template = Template.builder()
                .id(1)
                .group(templateGroup)
                .org(organization)
                .build();

        Recruit recruit = Recruit.builder()
                .id(1)
                .template(template)
                .build();

        ReviewCreateRequestDto requestDto = ReviewCreateRequestDto.builder()
                .recruitId(1)
                .title("제목")
                .content("내용")
                .isPublic(true)
                .uploadedImages(List.of("image1.jpg"))
                .build();

        when(userRepository.findById(volMockAuthDto.getUserId())).thenReturn(Optional.of(writer));
        when(recruitRepository.findById(requestDto.getRecruitId())).thenReturn(Optional.of(recruit));
        when(reviewRepository.existsByWriterAndRecruit(writer.getId(), recruit.getId())).thenReturn(true);

        // When & Then
        assertThrows(ConflictException.class, () -> reviewService.createReview(volMockAuthDto, requestDto));
    }

}
