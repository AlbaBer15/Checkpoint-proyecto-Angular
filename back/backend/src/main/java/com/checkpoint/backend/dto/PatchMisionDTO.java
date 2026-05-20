package com.checkpoint.backend.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

/**
 * Contiene los campos que el frontend puede enviar al editar una misión en patch.
 * Todos los campos son opcionales. Solo se actualizan los que llegan con valor.
 * Los campos {@code null} se ignoran en el service,
 * excepto {@code category} porque su comportamiento se tiene que controlar:
 * necesitamos saber si el frontend no la mandó (no se edita) o la manda como {@code null} (borrar).
 * Esto se gestiona con la flag {@code categoryPresent}.
 */
@Getter
@Setter
public class PatchMisionDTO {

    private String titulo;
    private String descripcion;
    private Integer xp;
    private String estado;
    private Boolean favorito;

    /** Lombok no genera setter para este campo porque {@link #setCategory} tiene lógica independiente que tenemos que
     * gestionar. */
    @Setter(AccessLevel.NONE)
    private CategoryRef category;

    /** {@code true} si el campo {@code "category"} apareció en el JSON. */
    @Setter(AccessLevel.NONE)
    private boolean categoryPresent = false;

    /**
     * Clase para categoría que guarda {@code id}.
     * Se usa ese id para cargar la categoría completa desde la base de datos.
     */
    @Getter
    @Setter
    public static class CategoryRef {
        private Long id;
    }

    /**
     * Jackson (libreria que convierte JSON a objetos Java) normalmente ignora los campos
     * que llegan como {@code null} y no llama al setter. Con la anotación forzamos la llamada
     * para activar {@code categoryPresent = true} y saber si viene con el JSON.
     */
    @JsonSetter(nulls = Nulls.SET)
    public void setCategory(CategoryRef category) {
        this.category = category;
        this.categoryPresent = true;
    }
}
