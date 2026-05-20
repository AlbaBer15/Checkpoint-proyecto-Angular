package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Category;
import com.checkpoint.backend.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categorías", description = "Gestión de categorías para clasificar misiones")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(summary = "Obtener todas las categorías")
    @ApiResponse(responseCode = "200", description = "Lista de categorías obtenida correctamente")
    @GetMapping
    public List<Category> getAll() {
        return categoryService.findAll();
    }

    @Operation(summary = "Obtener una categoría por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoría encontrada"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return categoryService.findById(id);
    }

    @Operation(summary = "Crear una nueva categoría")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoría creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@RequestBody Category category) {
        return categoryService.create(category);
    }

    @Operation(summary = "Eliminar una categoría")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Categoría eliminada correctamente"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}
