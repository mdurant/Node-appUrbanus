// src/controllers/offerController.js
const Offer = require('../models/Offer');
const logger = require('../utils/logger');

// Crear una nueva oferta
const createOffer = async (req, res) => {
  const { title, description, discount, valid_until } = req.body;
  const user_id = req.user.id;

  if (discount > 100 || discount < 0) {
    logger.warn(`El descuento ingresado (${discount}%) es inválido.`);
    return res.status(400).json({ message: 'El descuento debe estar entre 0 y 100%' });
  }

  const currentDate = new Date();
  if (new Date(valid_until) <= currentDate) {
    logger.warn('La fecha de validez no puede ser anterior o igual a la fecha de creación.');
    return res.status(400).json({ message: 'La fecha de validez debe ser posterior a la fecha actual.' });
  }

  try {
    const newOffer = await Offer.create({
      title,
      description,
      discount,
      valid_until,
      user_id
    });

    logger.info(`Oferta creada por usuario ID: ${user_id}`);
    res.status(201).json(newOffer);
  } catch (error) {
    logger.error(`Error al crear la oferta: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Listar todas las Ofertas
const listOffers = async (req, res) => {
    try {
        // Filtra solo ofertas con status "ACTIVE"
      const offers = await Offer.findAll({
        where: {
          status: 'ACTIVE',
        },
      });
      const offersTotal = offers.length;
      res.status(200).json({
        offer_total: offersTotal,
        offers: offers,
      });
    } catch (error) {
      logger.error(`Error al listar las ofertas: ${error.message}`);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  // Editar Oferta
// Actualizar una oferta
const updateOffer = async (req, res) => {
    const { id } = req.params;
    const { title, description, discount, valid_until } = req.body;
  
    if (discount > 100 || discount < 0) {
      logger.warn(`El descuento ingresado (${discount}%) es inválido.`);
      return res.status(400).json({ message: 'El descuento debe estar entre 0 y 100%' });
    }
  
    const currentDate = new Date();
    if (new Date(valid_until) <= currentDate) {
      logger.warn('La fecha de validez no puede ser anterior o igual a la fecha de creación.');
      return res.status(400).json({ message: 'La fecha de validez debe ser posterior a la fecha actual.' });
    }
  
    try {
      const offer = await Offer.findByPk(id);
      if (!offer) {
        logger.warn(`Oferta con ID ${id} no encontrada`);
        return res.status(404).json({ message: 'Oferta no encontrada' });
      }
  
      await offer.update({ title, description, discount, valid_until });
      logger.info(`Oferta con ID ${id} actualizada correctamente`);
      res.status(200).json(offer);
    } catch (error) {
      logger.error(`Error al actualizar la oferta: ${error.message}`);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  // Eliminar una Oferta.
  const deleteOffer = async (req, res) => {
    const { id } = req.params;
  
    try {
      const offer = await Offer.findByPk(id);
      if (!offer) {
        logger.warn(`Oferta con ID ${id} no encontrada`);
        return res.status(404).json({ message: 'Oferta no encontrada' });
      }
  
      await offer.destroy();
      logger.info(`Oferta con ID ${id} eliminada correctamente`);
      res.status(200).json({ message: 'Oferta eliminada correctamente' });
    } catch (error) {
      logger.error(`Error al eliminar la oferta: ${error.message}`);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };


module.exports = { createOffer, listOffers, updateOffer, deleteOffer  };
