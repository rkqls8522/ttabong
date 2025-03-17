package com.ttabong.service.search;

import com.ttabong.dto.search.RecruitRequestDto;
import com.ttabong.dto.search.RecruitResponseDto;

public interface SearchService {
    RecruitResponseDto searchTemplates(RecruitRequestDto request, Integer cursor, Integer limit);
}
