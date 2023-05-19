import { Contract } from '@ethersproject/contracts';
import { expect } from "chai";
import utils from './utils'
import { ethers, upgrades } from 'hardhat';
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import {UniswapV2} from "./utils/constant";

describe("HelperTest", function () {
  let helper: Contract;
  let pair: Contract;
  let mat: Contract;
  let mbt: Contract;
  let testToken1: Contract;
  let testToken2: Contract;
  let uniswapFactory: Contract;
  let uniswapRouter: Contract;
  let lp: Contract;
  let testLp: Contract;
  let deployer: SignerWithAddress;
  let userA: SignerWithAddress;
  let snapshotId: any;
  let tokenArray: string[];
  before(async function () {
    const [_deployer, _userA] = await ethers.getSigners();
    deployer = _deployer;
    userA = _userA;
    const Helper = await ethers.getContractFactory("Helper");
    const MAT = await ethers.getContractFactory("ERC20");
    const MBT = await ethers.getContractFactory("ERC20");
    const TestToken = await ethers.getContractFactory("ERC20");
    uniswapFactory = await ethers.getContractAt("IUniswapV2Factory", UniswapV2.Factory)
    uniswapRouter = await ethers.getContractAt("IUniswapV2Router", UniswapV2.Router)

    mat = await upgrades.deployProxy(MAT, ["Measher A Token", "MAT"])
    mbt = await upgrades.deployProxy(MBT, ["Measher B Token", "MBT"])
    helper = await upgrades.deployProxy(Helper, [utils.UniswapV2.Router])
    testToken1 = await upgrades.deployProxy(TestToken, ["Measher B Token", "MBT"])
    testToken2 = await upgrades.deployProxy(TestToken, ["Measher B Token", "MBT"])

    await uniswapFactory.createPair(mat.address, mbt.address)
    const pair = await uniswapFactory.getPair(mat.address, mbt.address)
    lp = await ethers.getContractAt("IUniswapV2Pair", pair)

    await uniswapFactory.createPair(testToken1.address, testToken2.address)
    const testPair = await uniswapFactory.getPair(mat.address, mbt.address)
    testLp = await ethers.getContractAt("IUniswapV2Pair", testPair)

    await mat.mint(deployer.address, utils.toUnit(1000))
    await mbt.mint(deployer.address, utils.toUnit(1000))
    await mat.mint(userA.address, utils.toUnit(100))
    await mbt.mint(userA.address, utils.toUnit(100))
    await testToken1.mint(userA.address, utils.toUnit(100))

    await utils.approveToken(mat.address, uniswapRouter.address, deployer)
    await utils.approveToken(mbt.address, uniswapRouter.address, deployer)
    await uniswapRouter.addLiquidity(mat.address, mbt.address, utils.toUnit(1000), utils.toUnit(1000), 0, 0, deployer.address, await utils.currentTime() + 100)

    tokenArray = [mat.address, mbt.address]
  });

  beforeEach(async () => {
    snapshotId = await utils.takeSnapshot()
  })
  afterEach(async () => {
    await utils.revertSnapshot(snapshotId)
  })

  describe("revert case test", async function () {
      it("MAT, MBT 외의 토큰으로 singleTokenAddLiquidity 호출시 revert", async function () {
        await expect(
            helper.connect(userA).singleTokenAddLiquidity(
                lp.address,
                testToken1.address,
                utils.toUnit(100),
                userA.address,
                await utils.currentTime() + 100)
        ).to.be.revertedWith("Helper : invalid Token");
      })
    it("각 토큰별로 유저가 충분한 수량을 가지지 못한 경우 revert", async function () {
      for (let token of tokenArray) {
        const tokenContract = await ethers.getContractAt("ERC20", token)
        await tokenContract.burn(userA.address, utils.toUnit(100))
        await expect(
            helper.connect(userA).singleTokenAddLiquidity(
                lp.address,
                token,
                utils.toUnit(100),
                userA.address,
                await utils.currentTime() + 100)
        ).to.be.revertedWith("Helper : insufficient Amount");
      }
    })
  })
  describe("시나리오 test", async function () {
    it("각 토큰별로 singleTokenAddLiquidity 요청하고 정상 통과 하는지", async function () {
      for(let token of tokenArray) {
        const tokenContract = await ethers.getContractAt("ERC20", token)
        const snapshot = await utils.takeSnapshot()
        const tokensymbol = await tokenContract.symbol()
        console.log(`----------${tokensymbol} case----------`)
        console.log('-Before singleTokenAddLiquidity')
        console.log(`${tokensymbol} balance : ${await tokenContract.balanceOf(userA.address)}`)
        console.log(`lpToken balance : ${await lp.balanceOf(userA.address)}`)
        await utils.approveToken(token, helper.address, userA)
        await helper.connect(userA).singleTokenAddLiquidity(
            lp.address,
            token,
            utils.toUnit(100),
            userA.address,
            await utils.currentTime() + 100)
        console.log('-After singleTokenAddLiquidity')
        console.log(`${tokensymbol} balance : ${await tokenContract.balanceOf(userA.address)}`)
        console.log(`lpToken balance : ${await lp.balanceOf(userA.address)}`)
        await utils.revertSnapshot(snapshot)
      }
    })
  })
});
