package com.example.finance.timeimport;

import com.example.finance.audit.AuditService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.common.validation.CpfUtils;
import com.example.finance.employee.Employee;
import com.example.finance.employee.EmployeeService;
import com.example.finance.employee.dto.EmployeeRequest;
import com.example.finance.membership.MembershipService;
import com.example.finance.security.SecurityUtils;
import com.example.finance.timeentry.TimeEntry;
import com.example.finance.timeentry.TimeEntryRepository;
import com.example.finance.timeentry.TimeEntrySource;
import com.example.finance.timeentry.TimeEntryType;
import com.example.finance.timeimport.dto.TimeImportBatchResponse;
import com.example.finance.timeimport.dto.TimeImportConfirmResponse;
import com.example.finance.timeimport.dto.TimeImportErrorResponse;
import com.example.finance.timeimport.dto.TimeImportPreviewResponse;
import com.example.finance.timeimport.dto.TimeImportPreviewRow;
import com.example.finance.timesheet.TimeSheetService;
import com.example.finance.user.Role;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.finance.exception.BusinessException;

@Service
@RequiredArgsConstructor
public class TimeImportService {

    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER);
    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.HR_VIEWER);
    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ISO_LOCAL_DATE
    );
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final MembershipService membershipService;
    private final EmployeeService employeeService;
    private final TimeEntryRepository timeEntryRepository;
    private final TimeImportBatchRepository batchRepository;
    private final TimeImportErrorRepository errorRepository;
    private final TimeSheetService timeSheetService;
    private final AuditService auditService;

    public TimeImportPreviewResponse preview(UUID companyId, MultipartFile file, boolean createMissingEmployees) {
        membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        List<TimeImportPreviewRow> rows = parse(companyId, file, createMissingEmployees);
        int valid = (int) rows.stream().filter(TimeImportPreviewRow::valido).count();
        return new TimeImportPreviewResponse(rows.size(), valid, rows.size() - valid, rows);
    }

    @Transactional
    public TimeImportConfirmResponse confirm(UUID companyId, MultipartFile file, boolean createMissingEmployees) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        List<TimeImportPreviewRow> rows = parse(companyId, file, createMissingEmployees);

        TimeImportBatch batch = new TimeImportBatch();
        batch.setCompany(company);
        batch.setFileName(file.getOriginalFilename() == null ? "importacao.csv" : file.getOriginalFilename());
        batch.setStatus(TimeImportBatchStatus.PROCESSING);
        batch.setImportedByUser(SecurityUtils.currentUser().getUser());
        batch.setTotalRows(rows.size());
        batch = batchRepository.saveAndFlush(batch);

        int success = 0;
        int error = 0;
        List<UUID> changedEmployees = new ArrayList<>();

        for (TimeImportPreviewRow row : rows) {
            if (!row.valido()) {
                saveError(companyId, batch, row.rowNumber(), row.cpf() + ";" + row.tipo(), row.mensagem());
                error++;
                continue;
            }
            try {
                Employee employee = employeeService.findByCpf(companyId, row.cpf());
                boolean duplicated = timeEntryRepository.findByCompanyIdAndEmployeeIdAndEntryDateAndEntryTimeAndType(
                        companyId, employee.getId(), row.data(), row.hora(), mapType(row.tipo())).isPresent();
                if (duplicated) {
                    saveError(companyId, batch, row.rowNumber(), row.cpf() + ";" + row.tipo(), "Marcacao duplicada ignorada.");
                    error++;
                    continue;
                }
                TimeEntry entry = new TimeEntry();
                entry.setCompany(company);
                entry.setEmployee(employee);
                entry.setEntryDate(row.data());
                entry.setEntryTime(row.hora());
                entry.setType(mapType(row.tipo()));
                entry.setSource(TimeEntrySource.CSV_IMPORT);
                entry.setNotes("Importado via CSV");
                timeEntryRepository.save(entry);
                changedEmployees.add(employee.getId());
                success++;
            } catch (Exception ex) {
                saveError(companyId, batch, row.rowNumber(), row.cpf() + ";" + row.tipo(), "Falha ao importar a linha.");
                error++;
            }
        }

        for (UUID employeeId : changedEmployees.stream().distinct().toList()) {
            LocalDate minDate = rows.stream().filter(TimeImportPreviewRow::valido).map(TimeImportPreviewRow::data).min(LocalDate::compareTo).orElse(LocalDate.now());
            LocalDate maxDate = rows.stream().filter(TimeImportPreviewRow::valido).map(TimeImportPreviewRow::data).max(LocalDate::compareTo).orElse(LocalDate.now());
            timeSheetService.recalculate(companyId, employeeId, minDate, maxDate);
        }

        batch.setSuccessRows(success);
        batch.setErrorRows(error);
        batch.setStatus(error > 0 ? TimeImportBatchStatus.COMPLETED_WITH_ERRORS : TimeImportBatchStatus.COMPLETED);
        batch.setFinishedAt(OffsetDateTime.now());
        batchRepository.save(batch);
        auditService.log(company, "IMPORT", "TIME_IMPORT_BATCH", batch.getId(), "Importacao de ponto concluida.");

        return new TimeImportConfirmResponse(batch.getId(), rows.size(), success, error, batch.getStatus().name());
    }

    public PageResponse<TimeImportBatchResponse> list(UUID companyId, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(batchRepository.findByCompanyId(companyId, PageRequest.of(page, size))
                .map(batch -> new TimeImportBatchResponse(batch.getId(), batch.getFileName(), batch.getStatus().name(),
                        batch.getTotalRows(), batch.getSuccessRows(), batch.getErrorRows(), batch.getCreatedAt(), batch.getFinishedAt())));
    }

    public List<TimeImportErrorResponse> errors(UUID companyId, UUID batchId) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        batchRepository.findByIdAndCompanyId(batchId, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Lote de importacao nao encontrado."));
        return errorRepository.findByCompanyIdAndBatchId(companyId, batchId).stream()
                .map(error -> new TimeImportErrorResponse(error.getRowNumber(), error.getErrorMessage()))
                .toList();
    }

    private List<TimeImportPreviewRow> parse(UUID companyId, MultipartFile file, boolean createMissingEmployees) {
        validateFile(file);
        try (var reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String sample = reader.readLine();
            if (sample == null) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "Arquivo CSV vazio.");
            }
            char delimiter = sample.contains(";") ? ';' : ',';
        } catch (IOException ex) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Nao foi possivel ler o arquivo CSV.");
        }

        try (var parser = buildParser(file)) {
            List<TimeImportPreviewRow> result = new ArrayList<>();
            for (CSVRecord record : parser) {
                int rowNumber = (int) record.getRecordNumber() + 1;
                result.add(validateRow(companyId, record, rowNumber, createMissingEmployees));
            }
            return result;
        } catch (IOException ex) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Nao foi possivel processar o arquivo CSV.");
        }
    }

    private CSVParser buildParser(MultipartFile file) throws IOException {
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);
        char delimiter = content.lines().findFirst().orElse("").contains(";") ? ';' : ',';
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setDelimiter(delimiter)
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true)
                .build();
        return CSVParser.parse(content, format);
    }

    private TimeImportPreviewRow validateRow(UUID companyId, CSVRecord record, int rowNumber, boolean createMissingEmployees) {
        String cpf = safe(record, "cpf");
        String nome = safe(record, "nome");
        String departamento = safe(record, "departamento");
        String tipo = safe(record, "tipo");

        if (!CpfUtils.isValid(cpf)) {
            return new TimeImportPreviewRow(rowNumber, cpf, nome, departamento, null, null, tipo, false, "CPF invalido.");
        }
        LocalDate data = parseDate(safe(record, "data"));
        LocalTime hora = parseTime(safe(record, "hora"));
        if (data == null || hora == null) {
            return new TimeImportPreviewRow(rowNumber, cpf, nome, departamento, data, hora, tipo, false, "Data ou hora invalida.");
        }
        if (mapTypeOrNull(tipo) == null) {
            return new TimeImportPreviewRow(rowNumber, cpf, nome, departamento, data, hora, tipo, false, "Tipo de marcacao invalido.");
        }

        Employee employee = null;
        try {
            employee = employeeService.findByCpf(companyId, cpf);
        } catch (Exception ignored) {
        }
        if (employee == null && !createMissingEmployees) {
            return new TimeImportPreviewRow(rowNumber, cpf, nome, departamento, data, hora, tipo, false, "Funcionario nao encontrado.");
        }
        if (employee == null) {
            employeeService.create(companyId, new EmployeeRequest(nome == null || nome.isBlank() ? "Funcionario Importado" : nome,
                    cpf, null, safe(record, "matricula"), departamento, "Nao informado", true));
        }

        return new TimeImportPreviewRow(rowNumber, cpf.replaceAll("\\D", ""), nome, departamento, data, hora, tipo, true, "Linha valida.");
    }

    private void saveError(UUID companyId, TimeImportBatch batch, int rowNumber, String rawContent, String message) {
        TimeImportError error = new TimeImportError();
        error.setCompany(batch.getCompany());
        error.setBatch(batch);
        error.setRowNumber(rowNumber);
        error.setRawContent(mask(rawContent));
        error.setErrorMessage(message);
        errorRepository.save(error);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 5 * 1024 * 1024L
                || (file.getOriginalFilename() != null && !file.getOriginalFilename().toLowerCase().endsWith(".csv"))) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Arquivo invalido. Envie um CSV UTF-8 com ate 5 MB.");
        }
    }

    private String safe(CSVRecord record, String column) {
        return record.isMapped(column) ? record.get(column).trim() : "";
    }

    private LocalDate parseDate(String value) {
        for (DateTimeFormatter formatter : DATE_FORMATS) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        return null;
    }

    private LocalTime parseTime(String value) {
        try {
            return LocalTime.parse(value, TIME_FORMAT);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private TimeEntryType mapType(String value) {
        TimeEntryType type = mapTypeOrNull(value);
        if (type == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Tipo de marcacao invalido.");
        }
        return type;
    }

    private TimeEntryType mapTypeOrNull(String value) {
        return switch (value == null ? "" : value.trim().toUpperCase()) {
            case "ENTRADA" -> TimeEntryType.CLOCK_IN;
            case "INICIO_ALMOCO" -> TimeEntryType.LUNCH_START;
            case "FIM_ALMOCO" -> TimeEntryType.LUNCH_END;
            case "SAIDA" -> TimeEntryType.CLOCK_OUT;
            case "AJUSTE_MANUAL" -> TimeEntryType.MANUAL_ADJUSTMENT;
            default -> null;
        };
    }

    private String mask(String rawContent) {
        return rawContent.replaceAll("(\\d{3})\\d{5}(\\d{3})", "$1*****$2");
    }
}
