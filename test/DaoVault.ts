import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { ethers } from 'hardhat'
// @ts-ignore
import { DaoVault } from '../typechain'
describe('DaoVault', () => {
  let DaoVault: DaoVault
  let owner: SignerWithAddress

  beforeEach(async () => {
    const signers = await ethers.getSigners()
    owner = signers[0]
    const DaoVaultFactory = await ethers.getContractFactory('DaoVault')
    DaoVault = await DaoVaultFactory.deploy()
    await DaoVault.deployed()
  })

  it('Correct Owner', async () => {
    const ownerFromContract = await DaoVault.owner()
    assert.equal(ownerFromContract, owner.address)
  })

  it('Contract Should Hold no DAI at start', async () => {
    const daiBalance = (await DaoVault.getDaiBalance()).toNumber()
    assert.equal(daiBalance, 0)
  })

  it('Should Rebalance The Vault ', async () => {
    await owner.sendTransaction({ to: DaoVault.address, value: ethers.utils.parseEther('1') })
    await DaoVault.wrapETH()
    await DaoVault.updateEthPriceUniswap()
    await DaoVault.rebalance()
    const daiBalance = Number(ethers.utils.formatEther(await DaoVault.getDaiBalance()))
    const wethBalance = Number(ethers.utils.formatEther(await DaoVault.getWethBalance()))
    console.log('ether balance', wethBalance, '/n', 'weth balance', daiBalance)
    assert.isAbove(daiBalance, 0)
  })
})
