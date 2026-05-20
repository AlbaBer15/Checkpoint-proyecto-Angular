package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Category;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void findById_lanzaExcepcion_si_categoria_no_existe() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.findById(99L));
    }

    @Test
    void create_lanzaExcepcion_si_nombre_vacio() {
        Category categoria = new Category();
        categoria.setNombre("  ");

        assertThrows(IllegalArgumentException.class, () -> categoryService.create(categoria));
    }

    @Test
    void create_guarda_categoria_correctamente() {
        Category categoria = new Category();
        categoria.setNombre("Deporte");

        Category guardada = new Category();
        guardada.setId(1L);
        guardada.setNombre("Deporte");

        when(categoryRepository.save(any())).thenReturn(guardada);

        Category resultado = categoryService.create(categoria);

        assertEquals("Deporte", resultado.getNombre());
        verify(categoryRepository).save(any());
    }
}
