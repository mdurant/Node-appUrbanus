// src/models/ServiceRequest.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize; // Asegúrate de que estás importando `sequelize` correctamente

class ServiceRequest extends Model {}

ServiceRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  campaign: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  client_data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  category_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reference_files: {
    type: DataTypes.STRING, // o JSON si se desea almacenar múltiples archivos
    allowNull: true,
  },
  terms_and_conditions: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  third_party_consent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Not completed',
  },
  step_pending: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'ServiceRequest',
  tableName: 'service_requests',
  timestamps: true,
  hooks: {
    beforeCreate: (serviceRequest) => {
      // Lógica de negocio previa a la creación del requerimiento de servicio
      setServiceRequestStatus(serviceRequest);
  },
    beforeUpdate: (serviceRequest) => {
        // Lógica de negocio previa a la actualización del requerimiento de servicio
        setServiceRequestStatus(serviceRequest);
    },
    },
});

function setServiceRequestStatus(serviceRequest) {
    
    const steps = serviceRequest.steps || [];
    // Buscar si alguno de los steps tiene status "CANCELED"
    const canceledStep = steps.find(step => step.status === 'CANCELED');
    
    if (serviceRequest.terms_and_conditions && serviceRequest.third_party_consent) {
        serviceRequest.status = 'Completed';
    } else {
        serviceRequest.status = 'Not completed';
    }

    if (canceledStep) {
        serviceRequest.status = 'Not completed';
        serviceRequest.step_pending = canceledStep.title; // Asigna el título del paso cancelado a `step_pending`
      } else if (steps.every(step => step.status === 'OK')) {
        serviceRequest.status = 'Completed';
        serviceRequest.step_pending = null; // No hay pasos pendientes si todos están en OK
      } else {
        serviceRequest.status = 'In progress';
        serviceRequest.step_pending = null; // Si hay estados mixtos, no hay un paso cancelado específico
      }
}

module.exports = ServiceRequest;
