const { ethers } = require('hardhat')
const { expect, assert } = require('chai')

describe('Test Bank contract', function() {
    let bank 
    let owner, addr1, addr2 

    describe('Initialization', function() {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners()
            let contract = await ethers.getContractFactory('Bank')
            bank = await contract.deploy()
        })

        it('should deploy the smart contract and check the Owner', async function() { 
            let theOwner = await bank.owner()
            assert.equal(owner.address, theOwner)
        })
    })

    describe('Deposit', function() {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners()
            let contract = await ethers.getContractFactory('Bank')
            bank = await contract.deploy()
        })

        it('should NOT deposit Ethers on the Bank contrat if NOT the owner', async function() {
            let etherQuantity = ethers.parseEther('0.1')
            await expect(
                bank.connect(addr1).deposit({ 
                    value: etherQuantity 
                })
            ).to.be.revertedWithCustomError(
                bank,
                "OwnableUnauthorizedAccount"
            ).withArgs(
                addr1.address
            )
        })

        it('should NOT deposit Ethers if NOT enough funds provided', async function() {
            let etherQuantity = ethers.parseEther('0.09')

            await expect(bank.deposit({ value: etherQuantity })).to.be.revertedWith('not enough funds provided')
        })

        it('should deposit Ethers if Owner and if enough funds provided', async function() {
            let etherQuantity = ethers.parseEther('0.1')
            await expect(bank.deposit({ value: etherQuantity}))
            .to.emit(
                bank,
                'Deposit'
            )
            .withArgs(
                owner.address,
                etherQuantity
            )

            let balance = await ethers.provider.getBalance(bank.target)
            assert(balance === etherQuantity)
        });
    })

    describe('Withdraw', function() {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners()
            let contract = await ethers.getContractFactory('Bank')
            bank = await contract.deploy()
            
            let etherQuantity = ethers.parseEther('0.1')
            let transaction = await bank.deposit({ 
                value: etherQuantity
            })
            await transaction.wait()
        })

        it('should NOT withdraw if NOT the owner', async function() {
            let etherQuantity = ethers.parseEther('0.1')
            await expect(bank.connect(addr1).withdraw(etherQuantity))
            .to.be.revertedWithCustomError(
                bank,
                "OwnableUnauthorizedAccount"
            ).withArgs(
                addr1.address
            )
        })

        it('should NOT withdraw if the owner try to withdraw too many ethers', async function() {
            let etherQuantity = ethers.parseEther('0.2')
            await expect(bank.withdraw(etherQuantity))
            .to.be.revertedWith('you cannot withdraw this amount')
        })

        it('should withdraw if the owner try to withdraw and the amount is correct', async function() {
            let etherQuantity = ethers.parseEther('0.05')
            await expect(bank.withdraw(etherQuantity))
            .to.emit(
                bank,
                'Withdraw'
            ).withArgs(
                owner.address,
                etherQuantity
            )
            let balanceSC = await ethers.provider.getBalance(bank.target)
            assert(balanceSC.toString() === "50000000000000000")
        })
    })
})
