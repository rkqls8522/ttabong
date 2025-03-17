package com.ttabong.service.recruit;

import com.ttabong.dto.user.AuthDto;
import com.ttabong.entity.recruit.Recruit;
import com.ttabong.entity.user.Organization;
import com.ttabong.entity.user.User;
import com.ttabong.repository.recruit.RecruitRepository;
import com.ttabong.repository.recruit.TemplateRepository;
import com.ttabong.servicejpa.recruit.OrgRecruitService;
import com.ttabong.util.CacheUtil;
import com.ttabong.util.service.ImageService;
import net.datafaker.Faker;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class OrgRecruitServiceImplTest {

    @Mock
    private TemplateRepository templateRepository;

    @Mock
    private RecruitRepository recruitRepository;

    @Mock
    private ImageService imageService;

    @Mock
    private CacheUtil cacheUtil;

    @InjectMocks
    private OrgRecruitService orgRecruitService;

    private Faker faker;
    private User mockUser;
    private Organization mockOrganization;

    @BeforeEach
    void setUp() {
        faker = new Faker();

        mockUser = User.builder()
                .id(1)
                .email(faker.internet().emailAddress())
                .name(faker.name().fullName())
                .password(faker.internet().password())
                .phone(faker.phoneNumber().cellPhone())
                .profileImage(faker.internet().image())
                .isDeleted(false)
                .createdAt(Instant.from(LocalDateTime.now()))
                .totalVolunteerHours(BigDecimal.ZERO)
                .build();

        mockOrganization = Organization.builder()
                .id(faker.number().randomDigitNotZero())
                .user(mockUser)
                .businessRegNumber(faker.business().creditCardNumber()) // 가짜 사업자 번호
                .orgName(faker.company().name())
                .representativeName(faker.name().fullName())
                .orgAddress(faker.address().fullAddress())
                .build();

    }

    private final AuthDto mockAuthDto = new AuthDto(1, "organization");

    private Recruit createRecruitWithEndTime(BigDecimal activityEnd, int daysFromToday) {

        LocalDateTime activityDate = LocalDateTime.now().plusDays(daysFromToday); // 오늘 날짜 + daysFromToday
        Recruit recruit = Recruit.builder()
                .activityDate(Date.from(activityDate.atZone(ZoneId.systemDefault()).toInstant()))
                .activityEnd((activityEnd))
                .build();
        return recruit;
    }

    @Nested
    @DisplayName("공고 시간 관련 테스트 그룹")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class ActivityTimeTest {

        @Test
        @DisplayName("금일 완료 예정 공고 테스트")
        void testActivityEndTimeInFuture() {
            Recruit recruit = createRecruitWithEndTime(new BigDecimal("23.59"), 0);

            int remainingMinutes = orgRecruitService.getMinutesToCompleteEvent(recruit);

            assertTrue(remainingMinutes > 0);
            System.out.println("✅ 테스트 통과: 활동 종료까지 남은 시간 = " + remainingMinutes + "분");
        }

        @Test
        void testActivityEndTimeInPast() {
            Recruit recruit = createRecruitWithEndTime(new BigDecimal("00.00"), 0);

            int remainingMinutes = orgRecruitService.getMinutesToCompleteEvent(recruit);

            assertTrue(remainingMinutes <= 0);
            System.out.println("✅ 테스트 통과: 이미 종료된 활동, 남은 시간 = " + remainingMinutes + "분");
        }

        @Test
        void testActivityEndTimeTomorrow() {
            Recruit recruit = createRecruitWithEndTime(new BigDecimal("23.59"), 1); // 내일 날짜, 10:00 종료

            int remainingMinutes = orgRecruitService.getMinutesToCompleteEvent(recruit);

            // 🔥 내일 종료니까 현재 시간이 오늘 10:00이라면 남은 시간은 1440분 이상이어야 함
            assertTrue(remainingMinutes > 1440);
            System.out.println("✅ 테스트 통과: 내일 종료되는 활동, 남은 시간 = " + remainingMinutes + "분");
        }

        @Nested
        @DisplayName("공고 템플릿 CRUD")
        @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
        class CreateTemplate {

        }
    }
}
