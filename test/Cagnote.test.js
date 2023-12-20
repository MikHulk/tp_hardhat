const { assert, expect } = require("chai");
const { ethers } = require('hardhat');
const { mine, time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe(
    "Cagnotte Tests",
    function () {
        let owner, addr1, addr2, addr3;
        let cagnotte;

        async function makeContract() {
            [owner, addr1, addr2] = await ethers.getSigners();
            cagnotte = await ethers.getContractFactory('Cagnotte');    
            cagnotte = await cagnotte.connect(owner).deploy(1000);
            console.log(
                "balance before",
                await ethers.provider.getBalance(cagnotte.target)
            );
        };

        async function showContractBalance() {
            console.log(
                "balance after",
                await ethers.provider.getBalance(cagnotte.target)
            );
        };
        
        describe("Test deploy rule", function() {
            it("goal > 0",
               async function() {
                   [owner, addr1, addr2] = await ethers.getSigners();
                   let cagnotte2 = await ethers.getContractFactory('Cagnotte');    
                   await expect(
                       cagnotte2.connect(owner).deploy(0)
                   ).to.be.revertedWith("Goal must be greater than 0");
               });
        });
        
        describe('Test deposit', function() {
            beforeEach(makeContract);
            afterEach(showContractBalance);
            it('non owner can deposit',
               async function() {
                   let deposit = BigInt(Math.pow(10, 18));
                   let bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === 0n,
                          "cagnotte balance is zero on init");
                   await expect(
                       cagnotte.connect(addr1)
                           .deposit({value: deposit})
                   ).to.be.emit(cagnotte, "Deposit");
                   bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === deposit,
                          "cagnotte balance is not udated after deposit");
               });
            it('cannot deposit',
               async function() {
                   let bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === 0n,
                          "cagnotte balance is zero on init");
                   await expect(
                       cagnotte.connect(addr1)
                           .deposit({value: 0n})
                   ).to.be.revertedWith("Deposit must be greater than 0");
               });
            
            it('owner can deposit',
               async function() {
                   let deposit = BigInt(Math.pow(10, 18));
                   let bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === 0n,
                          "cagnotte balance is zero on init");
                   await expect(
                       cagnotte.connect(owner)
                           .deposit({value: deposit})
                   ).to.be.emit(cagnotte, "Deposit");
                   bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === deposit,
                          "cagnotte balance is not updated after deposit");
               });
        });
    
        describe('Test withdrawal', function() {
            beforeEach(
                async function () {
                    await makeContract();
                    console.log("add some money");
                    let deposit = BigInt(Math.pow(10, 18));
                    await expect(cagnotte.connect(addr1)
                                 .deposit({value: deposit}))
                        .to.be.emit(cagnotte, "Deposit");
                    let bal = await ethers.provider.getBalance(cagnotte.target);
                    assert(bal === deposit,
                           `cagnotte balance ${bal} ≠ ${deposit} on init`);
                }
            );
            afterEach(showContractBalance);
            it('non owner cannot withdraw',
               async function() {
                   let ammount = BigInt(Math.pow(10, 18));
                   let bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === ammount,
                          `cagnotte balance is not ${ammount} on init`);
                   await expect(
                       cagnotte.connect(addr1)
                           .withdraw()
                   ).to.be.revertedWithCustomError(
                       cagnotte,
                       "OwnableUnauthorizedAccount"
                   );
                   bal = await ethers.provider.getBalance(cagnotte.target);
                   // should I test that ?
                   assert(bal === ammount,
                          "cagnotte balance has changed to " + bal);
                   console.log(bal);
               });
            it('owner can withdraw',
               async function() {
                   let ammount = BigInt(Math.pow(10, 18));
                   let bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === ammount,
                          `cagnotte balance is not ${ammount} on init`);
                   await expect(
                       cagnotte.connect(owner)
                           .withdraw()
                   ).to.be.emit(cagnotte, "Withdrawal");
                   bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === 0n,
                          "cagnotte balance has not changed: " + bal);
                   console.log(bal);
               });
        });
    
        describe('Test not withdrawal on undergoal', function() {
            beforeEach(
                async function () {
                    await makeContract();
                    console.log("add some money");
                    let deposit = 100n;
                    await expect(cagnotte.connect(addr1)
                                 .deposit({value: deposit}))
                        .to.be.emit(cagnotte, "Deposit");
                    let bal = await ethers.provider.getBalance(cagnotte.target);
                    assert(bal === deposit,
                           `cagnotte balance ${bal} ≠ ${deposit} on init`);
                }
            );
            afterEach(showContractBalance);
            it('non owner cannot withdraw on undergoal',
               async function() {
                   let ammount = 100n;
                   let bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === ammount,
                          `cagnotte balance is not ${ammount} on init`);
                   await expect(
                       cagnotte.connect(addr1)
                           .withdraw()
                   ).to.be.revertedWithCustomError(
                       cagnotte,
                       "OwnableUnauthorizedAccount"
                   );
                   bal = await ethers.provider.getBalance(cagnotte.target);
                   // should I test that ?
                   assert(bal === ammount,
                          "cagnotte balance has changed to " + bal);
                   console.log(bal);
               });
            it('owner cannot withdraw on undergoal',
               async function() {
                   let ammount = 100n;
                   let bal = await ethers.provider.getBalance(cagnotte.target);
                   assert(bal === ammount,
                          `cagnotte balance is not ${ammount} on init`);
                   await expect(
                       cagnotte.connect(owner)
                           .withdraw()
                   ).to.be.revertedWith(
                       "Goal not reached"
                   );
                   bal = await ethers.provider.getBalance(cagnotte.target);
                   // should I test that ?
                   assert(bal === ammount,
                          "cagnotte balance has changed to " + bal);
                   console.log(bal);
               });
        });
    }
);
