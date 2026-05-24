package com.example.finance.membership;

import com.example.finance.membership.dto.CompanyMembershipResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users/me/memberships")
@Tag(name = "Memberships")
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping
    public List<CompanyMembershipResponse> listCurrentUserMemberships() {
        return membershipService.listCurrentUserMemberships();
    }
}
