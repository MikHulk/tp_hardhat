const { assert, expect } = require("chai");
const { ethers } = require('hardhat');


describe(
    "SimpleStorage Tests",
    function () {
        let owner, addr1, addr2, addr3;
        let simpleStorage;

        beforeEach(async function() {
            [owner, addr1, addr2, addr3] = await ethers.getSigners();
            simpleStorage = await ethers.getContractFactory('SimpleStorage');
        
            simpleStorage = await simpleStorage.deploy();
        });
    
        describe('Get number, initial to 0', function() {
            it('should get the number and the number should be equal to 0',
               async function() {
                   let number = await simpleStorage.getNumber()
                   assert(
                       number.toString() === "0",
                       "initial number is not 0"
                   );
               });
        });
    
        describe('Get and set numbers', function() {
            it('should get the number and the number',
               async function() {
                   for (i=1; i < 256;i++) {
                       let n = BigInt(i * 10000);
                       await simpleStorage.setNumber(n);
                       let number = await simpleStorage.getNumber();
                       assert(
                           number === n,
                           `when setNumber(${n}), ${n} != ${number}`
                       );
                   }
               });
        });  
    }
);
