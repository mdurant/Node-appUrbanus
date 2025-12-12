// Script temporal para sincronizar modelos y crear tablas
// Este script crea las tablas basándose en los modelos Sequelize
// NOTA: Para producción, usa migraciones en lugar de sync()

process.loadEnvFile();

const { sequelize } = require('../src/config/db');
const Service = require('../src/models/Service');
const User = require('../src/models/User');
const Wallet = require('../src/models/Wallet');
const WalletBalance = require('../src/models/WalletBalance');
const WalletTransaction = require('../src/models/WalletTransaction');
const Subscription = require('../src/models/Subscription');
const Plan = require('../src/models/Plan');
const Offer = require('../src/models/Offer');
const ServiceRequest = require('../src/models/ServiceRequest');
const APIKey = require('../src/models/APIKey');
const LoginVerification = require('../src/models/LoginVerification');
const PasswordResetToken = require('../src/models/PasswordResetToken');
const Transaction = require('../src/models/Transaction');

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando modelos con la base de datos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    // Deshabilitar temporalmente las foreign key checks para evitar problemas de orden
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Sincronizar tablas en orden: primero las que no tienen dependencias
    console.log('📋 Sincronizando tablas base...');
    
    // Tablas sin dependencias
    await User.sync({ alter: false, force: false });
    console.log('  ✅ Users');
    
    await Plan.sync({ alter: false, force: false });
    console.log('  ✅ Plans');
    
    await Service.sync({ alter: false, force: false });
    console.log('  ✅ Services');
    
    await Offer.sync({ alter: false, force: false });
    console.log('  ✅ Offers');
    
    // Tablas que dependen de User
    console.log('📋 Sincronizando tablas dependientes...');
    await Wallet.sync({ alter: false, force: false });
    console.log('  ✅ Wallets');
    
    await APIKey.sync({ alter: false, force: false });
    console.log('  ✅ APIKeys');
    
    await LoginVerification.sync({ alter: false, force: false });
    console.log('  ✅ LoginVerifications');
    
    await PasswordResetToken.sync({ alter: false, force: false });
    console.log('  ✅ PasswordResetTokens');
    
    // Tablas que dependen de Wallet
    await WalletBalance.sync({ alter: false, force: false });
    console.log('  ✅ WalletBalances');
    
    await WalletTransaction.sync({ alter: false, force: false });
    console.log('  ✅ WalletTransactions');
    
    // Tablas que dependen de User y Plan
    await Subscription.sync({ alter: false, force: false });
    console.log('  ✅ Subscriptions');
    
    // Tablas que dependen de User y Service
    await ServiceRequest.sync({ alter: false, force: false });
    console.log('  ✅ ServiceRequests');
    
    // Tablas de transacciones
    await Transaction.sync({ alter: false, force: false });
    console.log('  ✅ Transactions');
    
    // Rehabilitar foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ Todas las tablas sincronizadas correctamente.');
    console.log('📊 Tablas creadas/verificadas en la base de datos.');
    
    process.exit(0);
  } catch (error) {
    // Asegurar que se rehabilite foreign key checks incluso si hay error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      // Ignorar error si la conexión ya está cerrada
    }
    
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncDatabase();


