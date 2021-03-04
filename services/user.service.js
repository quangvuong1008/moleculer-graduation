"use strict";
const { Currencies, Transactions, Wallets, Users, TypeWallets, Categories } = require('../models');
const admin = require('../utils/firebase_admin');
const { signJwt, verifyJwt } = require('../utils/jwt_token');
const { ERROR, AVATAR_DEFAULT } = require('../utils/constant');
const { success, error } = require('../utils/error');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('sequelize');
const { where } = require('sequelize');
const Op = sequelize.Op;

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: "user",

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
     * Verify Token
     */
    verifyToken: {
      cache: {
        keys: ["token"],
        ttl: 60 * 60 // 1 hour
      },
      params: {
        token: "string"
      },
      async handler(ctx) {
        const decoded = await verifyJwt(ctx.params.token);
        const { id } = decoded;
        if (id) {
          return await Users.findOne({
            where: { id }
          });
        }
      }
    },

    /**
     * get user by token
     *
     * @returns
     */
    getByToken: {
      auth: "required",
      rest: {
        method: "GET",
        path: "/get/token"
      },
      async handler(ctx) {
        const { user } = ctx.meta;

        const currentUser = await Users.findOne({
          where: { id: user.id },
          include: [{ model: Currencies, as: 'currency' }]
        });

        const categories = await Categories.findAll({
          where: { parentId: null },
          include: [{ model: Categories, as: "children" }]
        });
        const typeWallets = await TypeWallets.findAll();
        const currencies = await Currencies.findAll();

        return success({
          result: {
            user: currentUser,
            typeWallets,
            categories,
            currencies
          }
        });
      }
    },

    /**
     * get
     *
     * @returns
     */
    dashboard: {
      auth: "required",
      rest: {
        method: "GET",
        path: "/dashboard"
      },
      async handler(ctx) {
        const { user } = ctx.meta;

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

        return success({ result: { wallets, transactions } });
      }
    },

    /**
     * Login
     */
    login: {
      rest: {
        method: "POST",
        path: "/login"
      },
      async handler(ctx) {
        const { firebaseToken, uuid, isGuest = true } = ctx.params;

        let user = null;
        let decodedToken = null;
        let user_id = null;

        if (!isGuest) {
          // Get user's firebase uid
          decodedToken = await admin.auth().verifyIdToken(firebaseToken).then((decodedToken) => decodedToken);
          user_id = decodedToken.user_id;
          // Find user with social's uid
          user = await Users.findOne({
            where: { uid: user_id },
            include: [{ model: Currencies, as: 'currency' }]
          });
        } else if (uuid) {
          // Find guest with uuid, who dont have uid (social's uid)
          user = await Users.findOne({
            where: { uuid, uid: null },
            include: [{ model: Currencies, as: 'currency' }]
          });
        }

        // If not exist, let create new user
        if (!user) {
          const defaultCurrency = await Currencies.findOne({ where:{ currency: 'USD' } })

          if (isGuest) {
            // If user not exist, register
            const localUser = await Users.create({
              uuid: uuidv4(),
              name: 'Name',
              avatar: AVATAR_DEFAULT,
              currencyId: defaultCurrency.id,
            });
            user = localUser.toJSON();
            user.currency = defaultCurrency;
          } else {
            // If social login
            // Get user's firebase uid
            decodedToken = await admin.auth().verifyIdToken(firebaseToken).then((decodedToken) => decodedToken);
            user_id = decodedToken.user_id;

            const userInfo = await admin.auth().getUser(user_id).then((userRecord) => userRecord);
            const socialUser = await Users.create({
              uid: userInfo.uid,
              uuid: uuidv4(),
              name: userInfo.displayName,
              email: userInfo.email,
              avatar: userInfo.photoURL,
              currencyId: defaultCurrency.id,
            });
            user = socialUser.toJSON();
            user.currency = defaultCurrency;
          }
        }

        const token = signJwt({ uid: user.uid, uuid: user.uuid, id: user.id });

        // Master data
        const typeWallets = await TypeWallets.findAll();
        const categories = await Categories.findAll({
          where: { parentId: null },
          include: [
            { model: Categories, as: "children" }
          ]
        });
        const currencies = await Currencies.findAll();

        return success({
          result: {
            user,
            token,
            typeWallets,
            categories,
            currencies
          }
        });
      }
    },

    /**
     * update information
     */
    updateCurrency: {
      rest: {
        method: "PUT",
        path: "/currency/update"
      },
      async handler(ctx) {
        const { user } = ctx.meta;
        const { currencyId } = ctx.params;
        const res = await Users.update({ currencyId: currencyId }, {
          where: {
            uuid: user.uuid
          }
        });
        if (res && res[0]) {
          const res = await Currencies.findOne({
            where: {
              id: currencyId
            },
          });
          let result = { currency: res }
          return success({ result });
        } else {
          return error(ERROR.REQUEST_ERROR);
        }
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
  async stopped() { }
};
