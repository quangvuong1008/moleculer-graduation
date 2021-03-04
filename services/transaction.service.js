"use strict";
const { Transactions, Wallets, Categories, TypeWallets } = require("../models");
const { ERROR } = require("../utils/constant");
const { success, error } = require("../utils/error");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const _ = require("lodash");
const sequelize = require("sequelize");
const Op = sequelize.Op;

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: "transaction",

  /**
   * Settings
   */
  settings: {},

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    /**
     * create transaction
     *
     * @returns
     */
    create: {
      auth: "required",
      rest: {
        method: "POST",
        path: "/create",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const {
          walletId,
          walletFromId,
          walletToId,
          categoryId,
          balance,
          balanceMinus,
          balanceAdd,
          date,
          note,
          type,
        } = ctx.params;
        if (type == "transfer") {
          const walletMinus = await Wallets.update(
            { balance: balanceMinus },
            {
              where: {
                id: walletFromId,
              },
            }
          );
          const walletAdd = await Wallets.update(
            { balance: balanceAdd },
            {
              where: {
                id: walletToId,
              },
            }
          );
          const resultMinus = await Transactions.create({
            userUuid: user.uuid,
            walletId: walletFromId,
            categoryId,
            balance,
            date,
            note,
            type,
          });
          const resultAdd = await Transactions.create({
            userUuid: user.uuid,
            walletId: walletToId,
            categoryId,
            balance,
            date,
            note,
            type,
          });
          if (walletAdd && walletMinus && resultAdd && resultMinus) {
            return success({ resultMinus });
          } else {
            return error(ERROR.REQUEST_ERROR);
          }
        } else if (type == "expense") {
          const wallet = await Wallets.findOne({
            where: { id: walletId },
          });
          if (!wallet) {
            const { type, message } = ERROR.WALLET_NOT_FOUND;
            throw error({ type, message });
          }
          const category = await Categories.findOne({
            where: { id: categoryId },
          });
          if (!category) {
            const { type, message } = ERROR.CATEGORY_NOT_FOUND;
            throw error({ type, message });
          }
          const walletMinus = await Wallets.update(
            { balance: balanceMinus },
            {
              where: {
                id: walletId,
              },
            }
          );
          const result = await Transactions.create({
            userUuid: user.uuid,
            walletId,
            categoryId,
            balance,
            date,
            note,
            type,
          });
          if (walletMinus && result) {
            return success({ result });
          } else {
            return error(ERROR.REQUEST_ERROR);
          }
        } else {
          const wallet = await Wallets.findOne({
            where: { id: walletId },
          });
          if (!wallet) {
            const { type, message } = ERROR.WALLET_NOT_FOUND;
            throw error({ type, message });
          }
          const category = await Categories.findOne({
            where: { id: categoryId },
          });
          if (!category) {
            const { type, message } = ERROR.CATEGORY_NOT_FOUND;
            throw error({ type, message });
          }
          const walletAdd = await Wallets.update(
            { balance: balanceAdd },
            {
              where: {
                id: walletId,
              },
            }
          );
          const result = await Transactions.create({
            userUuid: user.uuid,
            walletId,
            categoryId,
            balance,
            date,
            note,
            type,
          });
          if (walletAdd && result) {
            return success({ result });
          } else {
            return error(ERROR.REQUEST_ERROR);
          }
        }
      },
    },

    /**
     * get list transaction
     *
     * @returns
     */
    list: {
      auth: "required",
      rest: {
        method: "GET",
        path: "/list/:page/:limit",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const { page = 0, limit = 10 } = ctx.params;
        const nLimit = parseInt(limit);
        const nPage = parseInt(page);

        const result = await Transactions.findAndCountAll({
          limit: nLimit,
          offset: nPage * nLimit,
          where: { userUuid: user.uuid },
          order: [["date", "DESC"]],
          include: [{ model: Categories, as: 'category' }],
        });
        return success({ result });
      },
    },

    /**
     * get list transaction by month
     *
     * @returns
     */
    listByMonth: {
      auth: "required",
      rest: {
        method: "GET",
        path: "/list/:year/:month/:page/:limit",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const { page = 0, limit = 10, year, month } = ctx.params;
        const nLimit = parseInt(limit);
        const nPage = parseInt(page);
        const dateQuery = year + "/" + month + "/01";
        const startOfMonth = moment(dateQuery)
          .clone()
          .startOf("month")
          .format("YYYY-MM-DD hh:mm");
        const endOfMonth = moment(dateQuery)
          .clone()
          .endOf("month")
          .format("YYYY-MM-DD hh:mm");

        const total = await Transactions.findOne({
          where: {
            userUuid: user.uuid,
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          attributes: [
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "income" THEN balance ELSE 0 END')), 'totalIncome'],
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "expense" THEN balance ELSE 0 END')), 'totalExpense']
          ],
        });

        const { totalIncome, totalExpense } = total.dataValues;

        const transactions = await Transactions.findAndCountAll({
          limit: nLimit,
          offset: nPage * nLimit,
          where: {
            userUuid: user.uuid,
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          order: [["date", "DESC"]],
          include: [{ model: Categories, as: 'category' }],
        });

        const totalRes = {
          total: transactions.count,
          income: totalIncome || 0,
          expense: totalExpense || 0,
        };

        return success({
          result: {
            wallets: {},
            total: totalRes,
            transactions: transactions.rows,
          },
        });
      },
    },
    /**
     * update transaction
     *
     * @returns
     */
    update: {
      auth: "required",
      rest: {
        method: "PUT",
        path: "/update",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const {
          id,
          walletId,
          walletFromId,
          walletToId,
          categoryId,
          balance,
          balanceMinus,
          balanceAdd,
          date,
          note,
          type,
        } = ctx.params;
        if (type == "transfer") {
          const walletMinus = await Wallets.update(
            { balance: balanceMinus },
            {
              where: {
                id: walletFromId,
              },
            }
          );
          const walletAdd = await Wallets.update(
            { balance: balanceAdd },
            {
              where: {
                id: walletToId,
              },
            }
          );
          const resultMinus = await Transactions.update({
            walletId: walletId,
            categoryId: categoryId,
            balance: balance,
            date: date,
            note: note,
            type: type,
          },
            {
              where: {
                id: id,
              },
            });
          const resultAdd = await Transactions.create({
            userUuid: user.uuid,
            walletId: walletToId,
            categoryId,
            balance,
            date,
            note,
            type,
          });
          if (walletAdd && walletMinus && resultAdd && resultMinus) {
            const transaction = await Transactions.findOne({
              where: { id },
              include: [{ model: Categories, as: 'category' }],
            });
            const wallets = await Wallets.findAll({
              where: { userUuid: user.uuid },
              include: [{ model: TypeWallets, as: "typeWallet" }]
            });

            const transactions = await Transactions.findAll({
              where: { userUuid: user.uuid },
              limit: 10,
              order: [
                ['date', 'DESC']
              ],
              include: [{ model: Categories, as: "category" }]
            });
            return success({ result: { transaction, wallets, transactions } });
          } else {
            return error(ERROR.REQUEST_ERROR);
          }
        } else if (type == "expense") {
          const walletMinus = await Wallets.update(
            { balance: balanceMinus },
            {
              where: {
                id: walletId,
              },
            }
          );
          const resultMinus = await Transactions.update({
            walletId: walletId,
            categoryId: categoryId,
            balance: balance,
            date: date,
            note: note,
            type: type,
          },
            {
              where: {
                id: id,
              },
            });
          if (walletMinus && resultMinus) {
            const transaction = await Transactions.findOne({
              where: { id },
              include: [{ model: Categories, as: 'category' }],
            });
            const wallets = await Wallets.findAll({
              where: { userUuid: user.uuid },
              include: [{ model: TypeWallets, as: "typeWallet" }]
            });

            const transactions = await Transactions.findAll({
              where: { userUuid: user.uuid },
              limit: 10,
              order: [
                ['date', 'DESC']
              ],
              include: [{ model: Categories, as: "category" }]
            });
            return success({ result: { transaction, wallets, transactions } });
          } else {
            return error(ERROR.REQUEST_ERROR);
          }
        } else {
          const walletAdd = await Wallets.update(
            { balance: balanceAdd },
            {
              where: {
                id: walletId,
              },
            }
          );
          const resultAdd = await Transactions.update({
            walletId: walletId,
            categoryId: categoryId,
            balance: balance,
            date: date,
            note: note,
            type: type,
          },
            {
              where: {
                id: id,
              },
            });
          if (walletAdd && resultAdd) {
            const transaction = await Transactions.findOne({
              where: { id },
              include: [{ model: Categories, as: 'category' }],
            });
            const wallets = await Wallets.findAll({
              where: { userUuid: user.uuid },
              include: [{ model: TypeWallets, as: "typeWallet" }]
            });

            const transactions = await Transactions.findAll({
              where: { userUuid: user.uuid },
              limit: 10,
              order: [
                ['date', 'DESC']
              ],
              include: [{ model: Categories, as: "category" }]
            });
            return success({ result: { transaction, wallets, transactions } });
          } else {
            return error(ERROR.REQUEST_ERROR);
          }
        }
      },
    },
    /**
     * delete transaction
     *
     * @returns
     */
    delete: {
      auth: "required",
      rest: {
        method: "DELETE",
        path: "/delete",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const { id, type, balance, walletId, balanceWallet } = ctx.params;
        let balanceUpdate = type == "income" ? balance : - balance;
        const wallet = await Wallets.update(
          { balance: balanceWallet - balanceUpdate },
          {
            where: {
              id: walletId,
            },
          }
        );
        const res = await Transactions.destroy({
          where: {
            id: id,
          },
        });
        if (res && wallet) {
          const wallets = await Wallets.findAll({
            where: { userUuid: user.uuid },
            include: [{ model: TypeWallets, as: "typeWallet" }]
          });

          const transactions = await Transactions.findAll({
            where: { userUuid: user.uuid },
            limit: 10,
            order: [
              ['date', 'DESC']
            ],
            include: [{ model: Categories, as: "category" }]
          });
          return success({ result: { code: 1, wallets, transactions } });
        } else {
          return error(ERROR.REQUEST_ERROR);
        }
      },
    },
    /**
     * get chart data by month
     *
     * @returns
     */
    chartByMonth: {
      auth: "required",
      rest: {
        method: "GET",
        path: "/chart/:year/:month",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const { year, month } = ctx.params;

        const dateQuery = year + "/" + month + "/01";
        const startOfMonth = moment(dateQuery)
          .clone()
          .startOf("month")
          .format("YYYY-MM-DD 00:00:00");
        const endOfMonth = moment(dateQuery)
          .clone()
          .endOf("month")
          .format("YYYY-MM-DD 23:59:59");

        const dailyChartData = await Transactions.findAll({
          where: {
            userUuid: user.uuid,
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          attributes: [
            [
              sequelize.fn("DATE", sequelize.col("date")),
              "transactionDate",
            ],
            [
              sequelize.fn(
                "SUM",
                sequelize.literal(
                  "CASE `Transactions`.`type` WHEN 'income' THEN balance ELSE 0 END"
                )
              ),
              "totalIncome",
            ],
            [
              sequelize.fn(
                "SUM",
                sequelize.literal(
                  "CASE `Transactions`.`type` WHEN 'expense' THEN balance ELSE 0 END"
                )
              ),
              "totalExpense",
            ],
          ],
          group: "transactionDate",
        });

        const categoryChartData = await Transactions.findAll({
          where: {
            userUuid: user.uuid,
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          attributes: [
            [
              sequelize.fn(
                "SUM",
                sequelize.literal(
                  "CASE `Transactions`.`type` WHEN 'income' THEN balance ELSE 0 END"
                )
              ),
              "totalIncome",
            ],
            [
              sequelize.fn(
                "SUM",
                sequelize.literal(
                  "CASE `Transactions`.`type` WHEN 'expense' THEN balance ELSE 0 END"
                )
              ),
              "totalExpense",
            ],
          ],
          group: "categoryId",
          include: [{ model: Categories, as: 'category' }],
        });

        return success({
          result: {
            dailyChartData,
            categoryChartData
          }
        });
      },
    },
    /**
     * get by id
     *
     * @returns
     */
    get: {
      auth: "required",
      rest: {
        method: "GET",
        path: "/get/:id",
      },
      async handler(ctx) {
        return "Transaction";
      },
    },
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {
    async getTotal({ condition }) {
      const incomeBalance = await Transactions.sum("balance", {
        where: {
          ...condition,
          type: "income",
        },
      });

      const expenseBalance = await Transactions.sum("balance", {
        where: {
          ...condition,
          type: "expense",
        },
      });

      return {
        income: incomeBalance,
        expense: expenseBalance,
      };
    },
  },

  /**
   * Service created lifecycle event handler
   */
  created() { },

  /**
   * Service started lifecycle event handler
   */
  async started() { },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() { },
};
