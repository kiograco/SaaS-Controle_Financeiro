package com.example.finance.employee;

import com.example.finance.employee.dto.EmployeeRequest;
import com.example.finance.employee.dto.EmployeeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    EmployeeResponse toResponse(Employee entity);
    void update(EmployeeRequest request, @MappingTarget Employee entity);
}
