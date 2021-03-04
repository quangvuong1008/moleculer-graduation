"use strict";
const { Categories, Transactions, Wallets, TypeWallets } = require("../models");
const { ERROR } = require("../utils/constant");
const { success, error } = require("../utils/error");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("sequelize");
const moment = require("moment");
const Op = sequelize.Op;
const _ = require("lodash");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: "wallet",

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
     * create wallet
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
        const { name, balance, typeWalletId } = ctx.params;
        const exist = await TypeWallets.findOne({
          where: { id: typeWalletId },
        });
        if (!exist) {
          const { type, message } = ERROR.TYPE_WALLET_NOT_FOUND;
          throw error({ type, message });
        }

        const result = await Wallets.create({
          userUuid: user.uuid,
          typeWalletId,
          name,
          balance,
        });
        return success({ result });
      },
    },

    /**
     * get list wallet
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

        const result = await Wallets.findAndCountAll({
          limit: nLimit,
          offset: nPage * nLimit,
          where: {
            userUuid: user.uuid,
          },
          order: [["id", "DESC"]],
          include: [{ model: TypeWallets, as: "typeWallet" }]
        });
        return success({ result });
      },
    },

    /**
     * Get by id
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
        const { user } = ctx.meta;
        const { id } = ctx.params;

        const result = await Wallets.findOne({
          where: {
            id: id,
            userUuid: user.uuid,
          },
          include: [{ model: TypeWallets, as: "typeWallet" }]
        });
        return success({ result });
      },
    },

    /**
     * Get transactions by wallet id
     *
     * @returns
     */
    getTransactionsByMonth: {
      auth: "required",
      rest: {
        method: "GET",
        path: "/get/:id/transactions/:year/:month/:page/:limit",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const { id, page = 0, limit = 100, year, month } = ctx.params;
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

        const wallet = await Wallets.findOne({
          where: {
            id: id,
            userUuid: user.uuid,
          },
          include: [{ model: TypeWallets, as: "typeWallet" }]
        });
        let condition = {
          userUuid: user.uuid,
          walletId: id,
        };
        condition["date"] = {
          [Op.between]: [startOfMonth, endOfMonth],
        };

        const total = await Transactions.findOne({
          where: {
           ...condition
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
           ...condition
          },
          order: [["date", "DESC"]],
          include: [{ model: Categories, as: "category" }]
        });

        const totalRes = {
          total: transactions.count,
          income: totalIncome || 0,
          expense: totalExpense || 0,
        };

        return success({
          result: {
            wallet: wallet,
            total: totalRes,
            transactions: transactions.rows,
          },
        });
      },
    },
     /**
     * Get transactions by wallet id
     *
     * @returns
     */
    getTransactionsByDate: {
      auth: "required",
      rest: {
        method: "POST",
        path: "/get_transactions_by_date",
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const { id, page = 0, limit = 100, from, to } = ctx.params;
        // TODO: Temporary disable paging
        // const nLimit = parseInt(limit);
        // const nPage = parseInt(page);

        let condition = {
          userUuid: user.uuid,
        };

        let wallet = {};
        if (id) {
          wallet = await Wallets.findOne({
            where: { id: id, userUuid: user.uuid },
            include: [{ model: TypeWallets, as: "typeWallet" }]
          });
          condition["walletId"] = wallet.id;
        }

        if (!_.isEmpty(from) && !_.isEmpty(to)) {
          condition["date"] = {
            [Op.between]: [from, to],
          }
        };

        const total = await Transactions.findOne({
          where: {
           ...condition
          },
          attributes: [
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "income" THEN balance ELSE 0 END')), 'totalIncome'],
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "expense" THEN balance ELSE 0 END')), 'totalExpense']
          ],
        });

        const { totalIncome, totalExpense } = total.dataValues;

        const transactions = await Transactions.findAndCountAll({
          // limit: nLimit,
          // offset: nPage * nLimit,
          where: {
            ...condition
          },
          include: [{ model: Categories, as: "category" }]
        });

        const totalRes = {
          total: transactions.count,
          income: totalIncome || 0,
          expense: totalExpense || 0,
        };

        return success({
          result: {
            wallet: wallet,
            total: totalRes,
            transactions: transactions.rows,
          },
        });
      },
    },
    /**
     * update wallet
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
        const { id, name, balance, typeWalletId } = ctx.params;
        const res = await Wallets.update({ name: name, balance: balance, typeWalletId: typeWalletId }, {
          where: {
            id: id
          }
        });
        if (res && res[0]) {
          const walletRes = await Wallets.findOne({
            where: {
              id: id
            },
            include: [{ model: TypeWallets, as: "typeWallet" }]
          });
          let result = { wallet: walletRes }
          return success({ result });
        } else {
          return error(ERROR.REQUEST_ERROR);
        }
      },
    },
    /**
     * delete wallet
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
        const { id } = ctx.params;
        const res = await Wallets.destroy({
          where: {
            id: id
          }
        });
        if (res) {
          const wallets = await Wallets.findAll({
            where: { userUuid: user.uuid },
            include: [{ model: TypeWallets, as: "typeWallet" }]
          });
          let result = { wallets: wallets };
          return success({ result });
        } else {
          return error(ERROR.REQUEST_ERROR);
        }
      },
    },
    /**
		 * get list balance by month
		 *
		 * @returns
		 */
		chartByMonth: {
			auth: "required",
			rest: {
				method: "GET",
				path: "/chart/:id/transaction/:year/:month",
			},
			async handler(ctx) {
				const { user } = ctx.meta;
        const { year, month, id } = ctx.params;
        console.log(user, year, month)
				const dateQuery = year + "/" + month + "/01";
				const startOfMonth = moment(dateQuery)
					.clone()
					.startOf("month")
					.format("YYYY-MM-DD hh:mm");
				const endOfMonth = moment(dateQuery)
					.clone()
					.endOf("month")
					.format("YYYY-MM-DD hh:mm");

				const total = await Transactions.findAll({
					where: {
            userUuid: user.uuid,
            walletId: id,
						date: {
							[Op.between]: [startOfMonth, endOfMonth],
						},
					},
					attributes: [
            'date',
						[
							sequelize.fn(
								"SUM",
								sequelize.literal(
									'CASE WHEN type = "income" THEN balance ELSE 0 END'
								)
							),
							"totalIncome",
						],
						[
							sequelize.fn(
								"SUM",
								sequelize.literal(
									'CASE WHEN type = "expense" THEN balance ELSE 0 END'
								)
							),
							"totalExpense",
						],
          ],
          group: 'date',
				});
				return success({
					result: {
						total: total,
					},
				});
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
  methods: {},

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
