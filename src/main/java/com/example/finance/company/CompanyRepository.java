package com.example.finance.company;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends SoftDeleteRepository<Company> {
    List<Company> findAllByActiveTrue();

    Optional<Company> findByIdAndActiveTrue(UUID id);

    boolean existsByCnpj(String cnpj);
}
