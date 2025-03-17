package com.ttabong.controller.search;

import com.ttabong.dto.search.RecruitRequestDto;
import com.ttabong.dto.search.RecruitResponseDto;
import com.ttabong.service.search.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/templates")
    public ResponseEntity<RecruitResponseDto> searchTemplates(
            @RequestParam(required = false) Integer cursor,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestBody RecruitRequestDto request) {

        RecruitResponseDto responseDto = searchService.searchTemplates(request, cursor, limit);
        return ResponseEntity.ok(responseDto);

    }
}
