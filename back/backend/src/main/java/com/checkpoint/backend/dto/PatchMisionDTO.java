package com.checkpoint.backend.dto;

public class PatchMisionDTO {

    private String titulo;
    private String descripcion;
    private Integer xp;
    private String estado;
    private Boolean favorito;
    private CategoryRef category;

    public static class CategoryRef {
        private Long id;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getXp() { return xp; }
    public void setXp(Integer xp) { this.xp = xp; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Boolean getFavorito() { return favorito; }
    public void setFavorito(Boolean favorito) { this.favorito = favorito; }

    public CategoryRef getCategory() { return category; }
    public void setCategory(CategoryRef category) { this.category = category; }
}
