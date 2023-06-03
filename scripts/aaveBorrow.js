const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")
const { wethErc20ABI } = require("../constants/wethErc20ABI.json")
const { poolABI } = require("../constants/poolABI.json")

async function main() {
    // The protocol treats everthing as ERC20 token
    await getWeth()
    const { deployer } = await getNamedAccounts()

    // Pool addresses proivder 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e
    // Pool address ^ from above contract
    const pool = await getPool(deployer)
    console.log(`Lending pool address ${pool.address}`)

    // deposit
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    // approve
    await aprroveERC20(wethTokenAddress, pool.address, AMOUNT, deployer)
    console.log("Depositing...")
    await pool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    let { availableBorrowsBase, totalDebtBase } = await getBorrowUserData(pool, deployer)
    // availableBorrowsEth ?? what the convertion rate on DAI is ?
    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = availableBorrowsBase.toString() * 0.95 * (1 / daiPrice.toNumber()) // we are to borrowing 100 % of availble token . only 95% that is ssecure
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    // how much we borrowed and how much we can borrow, how much we have in colatral

    // Borrow
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(pool, daiTokenAddress, amountDaiToBorrowWei, deployer)

    await getBorrowUserData(pool, deployer)

    // repay
    await repay(pool, daiTokenAddress, amountDaiToBorrowWei, deployer)
    await getBorrowUserData(pool, deployer)
}

async function getPool(account) {
    const poolAddressesProivder = await ethers.getContractAt(
        "IPoolAddressesProvider",
        "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
        account
    )
    const poolAddress = await poolAddressesProivder.getPool()

    const pool = await ethers.getContractAt("IPool", poolAddress, account)
    return pool
}

async function aprroveERC20(tokenAddress, spenderAddress, valueToSpend, account) {
    const wethToken = await ethers.getContractAt("IERC20", tokenAddress, account)
    const tx = await wethToken.approve(spenderAddress, valueToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

async function getBorrowUserData(pool, account) {
    const { totalCollateralBase, totalDebtBase, availableBorrowsBase } =
        await pool.getUserAccountData(account)
    console.log(`You have ${ethers.utils.formatEther(totalCollateralBase)} worth of ETH deposited.`)
    console.log(`You have ${ethers.utils.formatEther(totalDebtBase)} worth of ETH is borrowed`)
    console.log(`You can borrow ${ethers.utils.formatEther(availableBorrowsBase)} worth of ETH`)

    return { availableBorrowsBase, totalDebtBase }
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1] // latestRoundData returns (roundId,answer,startedAt,updatedAt,answeredInRound) we only need answer which is price and it is at index 1
    console.log(`DAI/ETH price is ${ethers.utils.formatEther(price.toString())} ETH`)
    return price
}

async function borrowDai(pool, daiAddress, amountDaiToBorrowWei, account) {
    const borrowTx = await pool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You borrowed DAI")
}

async function repay(pool, daiAddress, amount, account) {
    await aprroveERC20(daiAddress, pool.address, amount, account)
    const repayTx = await pool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
