# Ejercicio de Suscripción, Wallet y Plan

Este proyecto muestra cómo manejar planes de suscripción, billeteras (wallets) y transacciones en una aplicación Node.js usando **Sequelize**, **MySQL** y **Express**. Abarca la creación de planes (por ejemplo, Anual, Semestral, Mensual), la suscripción de un usuario a un plan y la integración con una `Wallet` (billetera digital) que registra transacciones, saldos por moneda y un historial de operaciones.

## Estructura de Modelos

1. **Plan** (`Plan.js`)  
   - Define planes con nombre, moneda y precio (e.g., “Anual” en CLP, “Mensual” en USD).  

2. **Subscription** (`Subscription.js`)  
   - Registra la suscripción de un usuario a un plan con fecha de inicio y fin, precio, moneda, estado (active/expired).  
   - Incluye un `transaction_token` para enlazar transacciones relacionadas.

3. **Wallet** (`Wallet.js`)  
   - Cada usuario tiene o puede tener una Wallet.  
   - Contiene información como:  
     - `subscription_plan`: Plan de suscripción vinculado.  
     - `last_transaction_token` y `last_transaction_date`: últimos movimientos.  
     - `total_transactions`: contador de transacciones.  
     - `is_blocked` para bloquear la wallet, etc.

4. **Transaction** (`Transaction.js`)  
   - Representa transacciones globales, como pagos de suscripción (`transaction_type = subscription`) o pagos bajo demanda (`on_demand_payment`).  
   - Se asocia a la wallet vía `wallet_id`.  

5. **WalletBalance** (`WalletBalance.js`)  
   - Maneja el saldo en cada **moneda** (CLP, USD) para una wallet.  
   - Permite manejar múltiples monedas.

6. **WalletTransaction** (`WalletTransaction.js`)  
   - Historial detallado de cada movimiento de la wallet (`add` o `subtract`).  
   - Guarda la moneda, monto, saldo resultante, fecha, etc.

## Migraciones

Para que tus modelos coincidan con las tablas en la base de datos, se usan **migraciones** de Sequelize:

1. **Crear migraciones** con `sequelize-cli model:generate` o manualmente.  
2. **Editar** las migraciones para usar `UUID` en los campos `id` y `ENUM` en los campos que lo requieran.  
3. **Ejecutar** `npx sequelize-cli db:migrate` para aplicar cambios en la DB.

Si agregas columnas nuevas (por ejemplo `subscription_plan`, `last_transaction_token`) y ya existe la tabla, crea migraciones como:

```bash
npx sequelize-cli migration:generate --name add-subscription_plan-to-wallets


## API Reference

  POST /api/subscriptions/create
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `jwt      ` | `string` | **Required**. Your JWT |

**Sample**
```bash

{
  "planType": "Anual",
  "price": "1000.00",
  "currency": "CLP",
  "startDate": "2025-01-01",
  "endDate": "2026-01-01"
}