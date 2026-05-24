package com.example.finance.costcenter;

import com.example.finance.audit.AuditService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.costcenter.dto.CostCenterRequest;
import com.example.finance.costcenter.dto.CostCenterResponse;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.user.Role;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CostCenterService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER);

    private final CostCenterRepository repository;
    private final MembershipService membershipService;
    private final AuditService auditService;

    public PageResponse<CostCenterResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndNameContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(this::toResponse));
    }

    public CostCenterResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return toResponse(find(companyId, id));
    }

    @Transactional
    public CostCenterResponse create(UUID companyId, CostCenterRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        CostCenter costCenter = new CostCenter();
        apply(request, costCenter);
        costCenter.setCompany(company);
        repository.save(costCenter);
        auditService.log(company, "CREATE", "COST_CENTER", costCenter.getId(), "Centro de custo criado.");
        return toResponse(costCenter);
    }

    @Transactional
    public CostCenterResponse update(UUID companyId, UUID id, CostCenterRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        CostCenter costCenter = find(companyId, id);
        apply(request, costCenter);
        repository.save(costCenter);
        auditService.log(company, "UPDATE", "COST_CENTER", costCenter.getId(), "Centro de custo atualizado.");
        return toResponse(costCenter);
    }

    @Transactional
    public void delete(UUID companyId, UUID id) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        CostCenter costCenter = find(companyId, id);
        costCenter.setDeletedAt(OffsetDateTime.now());
        repository.save(costCenter);
        auditService.log(company, "DELETE", "COST_CENTER", costCenter.getId(), "Centro de custo removido.");
    }

    public CostCenter find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Centro de custo nao encontrado."));
    }

    private void apply(CostCenterRequest request, CostCenter entity) {
        entity.setName(request.name());
        entity.setCode(request.code());
        entity.setActive(request.active());
    }

    private CostCenterResponse toResponse(CostCenter entity) {
        return new CostCenterResponse(entity.getId(), entity.getName(), entity.getCode(), entity.isActive());
    }
}
