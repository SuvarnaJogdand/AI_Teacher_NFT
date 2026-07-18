require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },

  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // ganache: {
    //   url: "http://127.0.0.1:8545",
    //   chainId: 1337,
    // },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // amoy: {
    //   url: process.env.RPC_URL,
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    //   chainId: 80002,
    // },

  },
};