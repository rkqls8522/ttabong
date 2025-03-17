package com.ttabong.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class CacheUtil {

    private final RedisTemplate<String, Long> redisKeyTemplate;
    private final RedisTemplate<String, String> redisTemplate;
    private final String TEMP_CACHE = "temp:path";
    private final long TTL_IN_MINUTES = 5; //분 단위임
    private final Set<Integer> processedCacheIds = ConcurrentHashMap.newKeySet();

    public Long generatePostId() {
        return redisKeyTemplate.opsForValue().increment("tempId");
    }

    public void mapTempPresignedUrlwithObjectPath(String tempPreSignedUrl, String objectPath) {
        redisTemplate.opsForHash().put(TEMP_CACHE, tempPreSignedUrl, objectPath);
        redisTemplate.expire(TEMP_CACHE, TTL_IN_MINUTES, TimeUnit.MINUTES);
    }

    public String findObjectPath(String preSignedUrl) {
        return (String) redisTemplate.opsForHash().get(TEMP_CACHE, preSignedUrl);
    }

    public boolean isProcessedCacheId(Integer cacheId) {
        return processedCacheIds.contains(cacheId);
    }

    public void markCacheIdAsProcessed(Integer cacheId) {
        processedCacheIds.add(cacheId);
    }

    public boolean addCompleteEventScheduler(Integer Id, Integer time) {
        redisTemplate.opsForValue().set("EVENT_COMPLETE: " + Id.toString(), "", time, TimeUnit.MINUTES);
        return true;
    }

    public boolean addDeadlineEventScheduler(Integer Id, Integer time) {
        redisTemplate.opsForValue().set("DEADLINE_PASS: " + Id.toString(), "", time, TimeUnit.MINUTES);
        return true;
    }

    public boolean removeEventSchedule(Integer Id) {
        redisTemplate.opsForValue().getAndDelete("EVENT_COMPLETE: " + Id.toString());
        return true;
    }

    public boolean removeDeadlineSchedule(Integer Id) {
        redisTemplate.opsForValue().getAndDelete("DEADLINE_PASS: " + Id.toString());
        return true;
    }
}
