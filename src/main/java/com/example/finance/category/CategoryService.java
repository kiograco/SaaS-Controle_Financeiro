package com.example.finance.category;

import com.example.finance.audit.AuditService;
import com.example.finance.category.dto.CategoryRequest;
import com.example.finance.category.dto.CategoryResponse;
import com.example.finance.common.dto.PageResponse;
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
public class CategoryService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER);

    private final CategoryRepository repository;
    private final CategoryMapper mapper;
    private final MembershipService membershipService;
    private final AuditService auditService;

    public PageResponse<CategoryResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndNameContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(mapper::toResponse));
    }

    public CategoryResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return mapper.toResponse(find(companyId, id));
    }

    @Transactional
    public CategoryResponse create(UUID companyId, CategoryRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        Category category = new Category();
        mapper.update(request, category);
        category.setCompany(company);
        category = repository.saveAndFlush(category);
        auditService.log(company, "CREATE", "CATEGORY", category.getId(), "Categoria criada.");
        return mapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse update(UUID companyId, UUID id, CategoryRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        Category category = find(companyId, id);
        mapper.update(request, category);
        repository.save(category);
        auditService.log(company, "UPDATE", "CATEGORY", category.getId(), "Categoria atualizada.");
        return mapper.toResponse(category);
    }

    @Transactional
    public void delete(UUID companyId, UUID id) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        Category category = find(companyId, id);
        category.setDeletedAt(OffsetDateTime.now());
        repository.save(category);
        auditService.log(company, "DELETE", "CATEGORY", category.getId(), "Categoria removida.");
    }

    public Category find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Categoria nao encontrada."));
    }
}
