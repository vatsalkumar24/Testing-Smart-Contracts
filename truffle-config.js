require("dotenv").config();

const projectId = process.env.PROJECT_ID;

module.exports = {
  contracts_directory: "./src/contracts",
  networks: {
    mainnet_fork: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "999", // Any network (default: none)
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    fork: {
      host: "localhost",
      port: 8545,
      network_id: "1",
    },
    ropsten: {
      url: `wss://ropsten.infura.io/ws/v3/${projectId}`,
      network_id: "3",
      websockets: true,
    },
  },
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: "0.6.6",
    },
  },
};
