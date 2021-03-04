'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TypeWallets', [
      { name: 'Cash', icon: 'cash' },
      { name: 'Credit Card', icon: 'creditCard' },
      { name: 'Debit Card', icon: 'debitCard' },
      { name: 'Bank Account', icon: 'bankAccount' },
      { name: 'E-Wallet', icon: 'eWallet' },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TypeWallets', null, {});
  }
};
