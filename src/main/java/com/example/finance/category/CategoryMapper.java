package com.example.finance.category;

import com.example.finance.category.dto.CategoryRequest;
import com.example.finance.category.dto.CategoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category entity);
    void update(CategoryRequest request, @MappingTarget Category entity);
}
