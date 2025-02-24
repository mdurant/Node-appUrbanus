// src/controllers/serviceController.js
const Service = require('../models/Service');
const logger = require('../utils/logger');
const { generateSlug } = require('../utils/slugUtils');

// Crear un nuevo servicio
exports.createService = async (req, res) => {
  try {
    const { name, description, tasks } = req.body;
    if (!name) {
      return res.status(400).json({ 
        code: 400, 
        message: 'El nombre del servicio es requerido.' });
    }

    // Generar slug a partir del nombre (ej. “Servicio Pintura” => “servicio-pintura”)
    const slug = generateSlug(name);

    // Se espera que tasks sea un array. Si viene string, parsear a array.
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    const newService = await Service.create({
      name,
      slug,
      description,
      tasks: tasksArray,
    });

    return res.status(201).json(newService);
  } catch (error) {
    logger.error(`Error al crear servicio: ${error.message}`);
    return res.status(500).json({ 
        code: 500,
        message: 'Error interno del servidor' });
  }
};

// Listar todos los servicios
exports.listServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    return res.status(200).json(services);
  } catch (error) {
    logger.error(`Error al listar servicios: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

// Listar servicios con paginación
exports.listServicesPaginated = async (req, res) => {
  try {
    // Leer query params ?page=1&limit=10
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calcular offset
    const offset = (page - 1) * limit;

    // findAndCountAll nos da rows y count
    const { rows: services, count } = await Service.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']], // Opcional, orden por fecha
    });

    // Calcular total de páginas
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      total: count,
      page,
      totalPages,
      data: services,
    });
  } catch (error) {
    logger.error(`Error al listar servicios paginados: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

// Obtener detalle de un servicio por slug
exports.getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const service = await Service.findOne({ where: { slug } });

    if (!service) {
      return res.status(404).json({ code: 404, message: 'Servicio no encontrado.' });
    }
    return res.status(200).json(service);
  } catch (error) {
    logger.error(`Error al obtener servicio: ${error.message}`);
    return res.status(500).json({ code: 200, message: 'Error interno del servidor' });
  }
};

// Actualizar un servicio
exports.updateService = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, description, tasks } = req.body;

    const service = await Service.findOne({ where: { slug } });
    if (!service) {
      return res.status(404).json({ code: 404, message: 'Servicio no encontrado.' });
    }

    // Si cambió el name, hay que actualizar el slug
    if (name) {
      service.slug = generateSlug(name);
      service.name = name;
    }
    if (description !== undefined) {
      service.description = description;
    }
    if (tasks !== undefined) {
      service.tasks = Array.isArray(tasks) ? tasks : service.tasks;
    }

    await service.save();
    return res.status(200).json(service);
  } catch (error) {
    logger.error(`Error al actualizar servicio: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

// Eliminar un servicio
exports.deleteService = async (req, res) => {
  try {
    const { slug } = req.params;
    const service = await Service.findOne({ where: { slug } });
    if (!service) {
      return res.status(404).json({ code: 404, message: 'Servicio no encontrado.' });
    }
    await service.destroy();
    return res.status(200).json({ code: 200, message: 'Servicio eliminado correctamente.' });
  } catch (error) {
    logger.error(`Error al eliminar servicio: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};
