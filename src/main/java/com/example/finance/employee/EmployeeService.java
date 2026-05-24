package com.example.finance.employee;

import com.example.finance.audit.AuditService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.common.validation.CpfUtils;
import com.example.finance.employee.dto.EmployeeRequest;
import com.example.finance.employee.dto.EmployeeResponse;
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
public class EmployeeService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.HR_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER);

    private final EmployeeRepository repository;
    private final EmployeeMapper mapper;
    private final MembershipService membershipService;
    private final AuditService auditService;

    public PageResponse<EmployeeResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndNameContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(mapper::toResponse));
    }

    public EmployeeResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return mapper.toResponse(find(companyId, id));
    }

    @Transactional
    public EmployeeResponse create(UUID companyId, EmployeeRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        validateCpf(request.cpf());
        repository.findByCompanyIdAndCpf(companyId, sanitizeCpf(request.cpf())).ifPresent(existing -> {
            throw new BusinessException(HttpStatus.CONFLICT, "Ja existe um funcionario com este CPF.");
        });
        Employee employee = new Employee();
        mapper.update(request, employee);
        employee.setCpf(sanitizeCpf(request.cpf()));
        employee.setCompany(company);
        repository.save(employee);
        auditService.log(company, "CREATE", "EMPLOYEE", employee.getId(), "Funcionario criado.");
        return mapper.toResponse(employee);
    }

    @Transactional
    public EmployeeResponse update(UUID companyId, UUID id, EmployeeRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        validateCpf(request.cpf());
        Employee employee = find(companyId, id);
        mapper.update(request, employee);
        employee.setCpf(sanitizeCpf(request.cpf()));
        repository.save(employee);
        auditService.log(company, "UPDATE", "EMPLOYEE", employee.getId(), "Funcionario atualizado.");
        return mapper.toResponse(employee);
    }

    @Transactional
    public void delete(UUID companyId, UUID id) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        Employee employee = find(companyId, id);
        employee.setDeletedAt(OffsetDateTime.now());
        repository.save(employee);
        auditService.log(company, "DELETE", "EMPLOYEE", employee.getId(), "Funcionario removido.");
    }

    public Employee find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Funcionario nao encontrado."));
    }

    public Employee findByCpf(UUID companyId, String cpf) {
        return repository.findByCompanyIdAndCpf(companyId, sanitizeCpf(cpf))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Funcionario nao encontrado para o CPF informado."));
    }

    public String sanitizeCpf(String cpf) {
        return cpf.replaceAll("\\D", "");
    }

    private void validateCpf(String cpf) {
        if (!CpfUtils.isValid(cpf)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Informe um CPF valido.");
        }
    }
}
