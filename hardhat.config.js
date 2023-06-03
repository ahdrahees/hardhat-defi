/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.18",
}

require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
const MAINNET_RPC_URL =
    process.env.MAINNET_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const POLYGON_MAINNET_RPC_URL =
    process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-mainnet.alchemyapi.io/v2/YOUR-API-KEY"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "Your polygonscan API key"

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "Your coinmarketcap API key"
const REPORT_GAS = process.env.REPORT_GAS || false

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
        },
        localhost: {
            chainId: 31337,
            url: "http://127.0.0.1:8545/",
        },
        sepolia: {
            chainId: 1115111,
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
            saveDeployments: true,
        },
        mainnet: {
            chainId: 1,
            url: MAINNET_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
            saveDeployments: true,
        },
        polygon: {
            chainId: 137,
            url: POLYGON_MAINNET_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
            saveDeployments: true,
        },
    },
    solidity: {
        compilers: [
            { version: "0.8.18" },
            { version: "0.8.8" },
            { version: "0.6.12" },
            { version: "0.4.19" },
        ],
    },
    etherscan: {
        apikeys: {
            sepolia: ETHERSCAN_API_KEY,
            mainnet: ETHERSCAN_API_KEY,
            polygon: POLYGONSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
}
