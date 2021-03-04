'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories', [
      {
        id: 1,
        name: "Food & Drinks",
        icon: "ic001",
        type: "expense"
      },
      {
        id: 8,
        parentId: 1,
        name: "Groceries",
        icon: "ic008",
        type: "expense"
      },
      {
        id: 9,
        parentId: 1,
        name: "Restaurant",
        icon: "ic009",
        type: "expense"
      },
      {
        id: 10,
        parentId: 1,
        name: "Bar, Cafe",
        icon: "ic010",
        type: "expense"
      },
      {
        id: 2,
        name: "Shopping",
        icon: "ic002",
        type: "expense"
      },
      {
        id: 11,
        parentId: 2,
        name: "Clothes",
        icon: "ic011",
        type: "expense"
      },
      {
        id: 12,
        parentId: 2,
        name: "Health & beauty",
        icon: "ic012",
        type: "expense"
      },
      {
        id: 13,
        parentId: 2,
        name: "Kids",
        icon: "ic013",
        type: "expense"
      },
      {
        id: 14,
        parentId: 2,
        name: "Pets",
        icon: "ic014",
        type: "expense"
      },
      {
        id: 15,
        parentId: 2,
        name: "Home decor, furniture",
        icon: "ic015",
        type: "expense"
      },
      {
        id: 16,
        parentId: 2,
        name: "Electronics",
        icon: "ic016",
        type: "expense"
      },
      {
        id: 17,
        parentId: 2,
        name: "Gifs, joy",
        icon: "ic017",
        type: "expense"
      },
      {
        id: 18,
        parentId: 2,
        name: "Drug-store, chemist",
        icon: "ic018",
        type: "expense"
      },
      {
        id: 3,
        name: "Housing",
        icon: "ic003",
        type: "expense"
      },
      {
        id: 19,
        parentId: 3,
        name: "Rent",
        icon: "ic019",
        type: "expense"
      },
      {
        id: 20,
        parentId: 3,
        name: "Mortgage",
        icon: "ic020",
        type: "expense"
      },
      {
        id: 21,
        parentId: 3,
        name: "Energy, utilities",
        icon: "ic021",
        type: "expense"
      },
      {
        id: 22,
        parentId: 3,
        name: "Servies",
        icon: "ic022",
        type: "expense"
      },
      {
        id: 23,
        parentId: 3,
        name: "Maintain, repair",
        icon: "ic023",
        type: "expense"
      },
      {
        id: 4,
        name: "Transportation",
        icon: "ic004",
        type: "expense"
      },
      {
        id: 24,
        parentId: 4,
        name: "Public transport",
        icon: "ic024",
        type: "expense"
      },
      {
        id: 25,
        parentId: 4,
        name: "Taxi",
        icon: "ic025",
        type: "expense"
      },
      {
        id: 26,
        parentId: 4,
        name: "Long distance",
        icon: "ic026",
        type: "expense"
      },
      {
        id: 27,
        parentId: 4,
        name: "Fuel",
        icon: "ic027",
        type: "expense"
      },
      {
        id: 28,
        parentId: 4,
        name: "Parking",
        icon: "ic028",
        type: "expense"
      },
      {
        id: 29,
        parentId: 4,
        name: "Vehicle maintain",
        icon: "ic039",
        type: "expense"
      },
      {
        id: 5,
        name: "Life & Entertainment",
        icon: "ic005",
        type: "expense"
      },
      {
        id: 30,
        parentId: 5,
        name: "Health care, doctor",
        icon: "ic030",
        type: "expense"
      },
      {
        id: 31,
        parentId: 5,
        name: "Wellness, beauty",
        icon: "ic031",
        type: "expense"
      },
      {
        id: 32,
        parentId: 5,
        name: "Active sprot, fitness",
        icon: "ic032",
        type: "expense"
      },
      {
        id: 33,
        parentId: 5,
        name: "Life events",
        icon: "ic033",
        type: "expense"
      },
      {
        id: 34,
        parentId: 5,
        name: "Hobbies",
        icon: "ic034",
        type: "expense"
      },
      {
        id: 35,
        parentId: 5,
        name: "Education",
        icon: "ic035",
        type: "expense"
      },
      {
        id: 36,
        parentId: 5,
        name: "Book, audio, subcriptions",
        icon: "ic036",
        type: "expense"
      },
      {
        id: 37,
        parentId: 5,
        name: "Holiday, trips, hotel",
        icon: "ic037",
        type: "expense"
      },
      {
        id: 38,
        parentId: 5,
        name: "Charity, gifts",
        icon: "ic038",
        type: "expense"
      },
      {
        id: 39,
        parentId: 5,
        name: "Lottery, gambling",
        icon: "ic039",
        type: "expense"
      },
      {
        id: 6,
        name: "Finance Expenses",
        icon: "ic006",
        type: "expense"
      },
      {
        id: 40,
        parentId: 6,
        name: "Taxes",
        icon: "ic040",
        type: "expense"
      },
      {
        id: 41,
        parentId: 6,
        name: "Insurances",
        icon: "ic041",
        type: "expense"
      },
      {
        id: 42,
        parentId: 6,
        name: "Loan, interest",
        icon: "ic042",
        type: "expense"
      },
      {
        id: 43,
        parentId: 6,
        name: "Fines",
        icon: "ic043",
        type: "expense"
      },
      {
        id: 44,
        parentId: 6,
        name: "Charges, fees",
        icon: "ic044",
        type: "expense"
      },
      {
        id: 7,
        name: "income",
        icon: "ic007",
        type: "income"
      },
      {
        id: 45,
        parentId: 7,
        name: "Wage, invoices",
        icon: "ic045",
        type: "income"
      },
      {
        id: 46,
        parentId: 7,
        name: "Sale",
        icon: "ic046",
        type: "income"
      },
      {
        id: 47,
        parentId: 7,
        name: "Rental income",
        icon: "ic047",
        type: "income"
      },
      {
        id: 48,
        parentId: 7,
        name: "Checks, coupon",
        icon: "ic048",
        type: "income"
      },
      {
        id: 49,
        parentId: 7,
        name: "Lottery, gambling",
        icon: "ic049",
        type: "income"
      },
      {
        id: 50,
        parentId: 7,
        name: "Refunds",
        icon: "ic050",
        type: "income"
      },
      {
        id: 51,
        parentId: 7,
        name: "Gifts",
        icon: "ic051",
        type: "income"
      },
      {
        id: 52,
        name: "Transfer",
        icon: "transfer",
        type: "transfer"
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Categories', null, {});
  }
};
