import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: "0.8.11",
  networks: {
    hardhat: {
      forking: {
        url: 'https://eth.llamarpc.com', // ETH node
      },
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        initialIndex: 0,
        accountsBalance: '10000000000000000000000000' // 10,000,000 ETH
      },
      blockGasLimit: 30000000,
    },
  }
};

export default config;
