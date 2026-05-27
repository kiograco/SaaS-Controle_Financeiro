package com.example.finance.timeschedule;

import com.example.finance.audit.AuditService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.employee.EmployeeService;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.timeschedule.dto.EmployeeWorkScheduleRequest;
import com.example.finance.timeschedule.dto.WorkScheduleRequest;
import com.example.finance.timeschedule.dto.WorkScheduleResponse;
import com.example.finance.user.Role;
import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.HR_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER);

    private final WorkScheduleRepository repository;
    private final EmployeeWorkScheduleRepository assignmentRepository;
    private final EmployeeService employeeService;
    private final MembershipService membershipService;
    private final AuditService auditService;

    public PageResponse<WorkScheduleResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndNameContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(this::toResponse));
    }

    public WorkScheduleResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return toResponse(find(companyId, id));
    }

    @Transactional
    public WorkScheduleResponse create(UUID companyId, WorkScheduleRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        WorkSchedule entity = new WorkSchedule();
        apply(request, entity);
        entity.setCompany(company);
        repository.save(entity);
        auditService.log(company, "CREATE", "WORK_SCHEDULE", entity.getId(), "Jornada criada.");
        return toResponse(entity);
    }

    @Transactional
    public WorkScheduleResponse update(UUID companyId, UUID id, WorkScheduleRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        WorkSchedule entity = find(companyId, id);
        apply(request, entity);
        repository.save(entity);
        auditService.log(company, "UPDATE", "WORK_SCHEDULE", entity.getId(), "Jornada atualizada.");
        return toResponse(entity);
    }

    @Transactional
    public void assign(UUID companyId, EmployeeWorkScheduleRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        EmployeeWorkSchedule assignment = new EmployeeWorkSchedule();
        assignment.setCompany(company);
        assignment.setEmployee(employeeService.find(companyId, request.employeeId()));
        assignment.setWorkSchedule(find(companyId, request.workScheduleId()));
        assignment.setStartDate(request.startDate());
        assignmentRepository.save(assignment);
        auditService.log(company, "CREATE", "WORK_SCHEDULE_ASSIGNMENT", assignment.getId(), "Jornada vinculada ao funcionario.");
    }

    public WorkSchedule find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Jornada nao encontrada."));
    }

    public EmployeeWorkSchedule currentAssignment(UUID companyId, UUID employeeId, java.time.LocalDate date) {
        return assignmentRepository
                .findFirstByCompanyIdAndEmployeeIdAndStartDateLessThanEqualAndEndDateIsNullOrderByStartDateDesc(companyId, employeeId, date)
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Funcionario sem jornada ativa para a data informada."));
    }

    private void apply(WorkScheduleRequest request, WorkSchedule entity) {
        entity.setName(request.name());
        entity.setWorkingDays(serializeWorkingDays(request.workingDays()));
        entity.setExpectedDailyMinutes(request.expectedDailyMinutes());
        entity.setToleranceMinutes(request.toleranceMinutes());
        entity.setLunchBreakMinutes(request.lunchBreakMinutes());
        entity.setStartTime(request.startTime());
        entity.setEndTime(request.endTime());
        entity.setActive(request.active());
    }

    private WorkScheduleResponse toResponse(WorkSchedule entity) {
        return new WorkScheduleResponse(entity.getId(), entity.getName(), parseWorkingDays(entity.getWorkingDays()), entity.getExpectedDailyMinutes(),
                entity.getToleranceMinutes(), entity.getLunchBreakMinutes(), entity.getStartTime(), entity.getEndTime(), entity.isActive());
    }

    private String serializeWorkingDays(List<DayOfWeek> workingDays) {
        return workingDays.stream()
                .distinct()
                .map(DayOfWeek::name)
                .collect(Collectors.joining(","));
    }

    private List<DayOfWeek> parseWorkingDays(String workingDays) {
        return Arrays.stream(workingDays.split(","))
                .filter(day -> !day.isBlank())
                .map(DayOfWeek::valueOf)
                .toList();
    }
}
