// src/utils/slugUtils.js
exports.generateSlug = (name) => {
    //pasar a minúsculas
    let slug = name.toLowerCase();
    //quitar tildes
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    //reemplazar espacios por "-"
    slug = slug.replace(/\s+/g, '-');
    //quitar caracteres no deseados (opcional), etc.
    slug = slug.replace(/[^\w-]+/g, '');
    return slug;
  };
  