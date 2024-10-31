const ServiceRequest = require('../models/ServiceRequest');
const logger = require('../utils/logger');

// Crear nuevo requerimiento de servicio
const createServiceRequest = async (req, res) => {
  const { campaign, steps, client_data, category_type, service, reference_files, 
        terms_and_conditions, third_party_consent, status, step_pending, date 
        } = req.body;

  if (!terms_and_conditions || !third_party_consent) {
    logger.warn('El usuario no aceptó los términos y condiciones o el consentimiento de terceros.');
    return res.status(400).json({ message: 'Debe aceptar los términos y condiciones y el consentimiento de terceros.' });
  }

  try {
    const newServiceRequest = await ServiceRequest.create({
      campaign,
      steps,
      client_data,
      category_type,
      service,
      reference_files,
      terms_and_conditions,
      third_party_consent,
      status,
      step_pending,
      date
    });

    logger.info('Requerimiento de servicio creado exitosamente.');
    res.status(201).json(newServiceRequest);
  } catch (error) {
    logger.error(`Error al crear el requerimiento de servicio: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Listar todos los requerimientos de servicio Status: completed and step_pending: null
const listServiceRequests = async (req, res) => {
  try {
        // Buscar Service Requests con status "Completed" y "step_pending" nulo
        const serviceRequests = await ServiceRequest.findAll({
          where: {
            status: 'Completed',
            step_pending: null
          }
        });
        const serviceRequestTotal = serviceRequests.length; //Contar solo los requerimientos de servicio completados
    logger.info('Requerimientos de servicio listados exitosamente.');
    res.status(200).json({
      code: 200,
      serviceRequest_total: serviceRequestTotal,
      serviceRequests
    });
  } catch (error) {
    logger.error(`Error al listar los requerimientos de servicio: ${error.message}`);
    res.status(500).json({ 
      code: 500,
      message: 'Error interno del servidor' });
  }
};

module.exports = { createServiceRequest, listServiceRequests };
