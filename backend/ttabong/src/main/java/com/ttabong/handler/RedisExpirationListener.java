package com.ttabong.handler;

import com.ttabong.service.sns.ReviewService;
import com.ttabong.servicejpa.recruit.OrgRecruitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

public class RedisExpirationListener extends KeyExpirationEventMessageListener {


    private final OrgRecruitService orgRecruitService;
    private final ReviewService reviewService;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    public RedisExpirationListener(RedisMessageListenerContainer listenerContainer, OrgRecruitService orgRecruitService, ReviewService reviewService) {
        super(listenerContainer);
        this.orgRecruitService = orgRecruitService;
        this.reviewService = reviewService;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {

        String[] expireMessage = message.toString().split(" ");
        if (expireMessage[0].equals("EVENT_COMPLETE:")) {
            logger.info("{}번 공고 활동 완료", message);
            orgRecruitService.updateCompleteRecruitStatus(Integer.parseInt(expireMessage[1]));
            reviewService.createReviewAfterSchedule(Integer.parseInt(expireMessage[1]));
        }else if (expireMessage[0].equals("DEADLINE_PASS:")) {
            logger.info("{}번 공고 모집 마감", message);
            orgRecruitService.updateDeadlineRecruitStatus(Integer.parseInt(expireMessage[1]));
        }
    }
}
