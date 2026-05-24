package com.example.finance.audit;

import com.example.finance.company.Company;
import com.example.finance.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(Company company, String action, String resource, java.util.UUID resourceId, String description) {
        AuditLog auditLog = new AuditLog();
        auditLog.setCompany(company);
        auditLog.setUser(SecurityUtils.currentUser().getUser());
        auditLog.setAction(action);
        auditLog.setResource(resource);
        auditLog.setResourceId(resourceId == null ? "" : resourceId.toString());
        auditLog.setDescription(description);
        auditLogRepository.save(auditLog);
    }
}
