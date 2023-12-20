async function main() {
    const factory = await ethers.getContractFactory('Bank')
    const contract = factory.attach(
        "0x2dC9A28ee4c1ADD103E103Ec8F4c15F4F5aAe43B"
    )
    let account = (await ethers.getSigners())[0].address;
    let balance = await contract.getBalance(account);
    console.log(`${account} balance :  ${balance}`);

    console.log("send 1000 wei");
    let tr = await contract.sendEthers({value: 1000});
    await tr.wait();

    balance = await contract.getBalance(account);
    console.log(`${account} balance :  ${balance}`);
   
    console.log(`withdraw ${balance} wei`);
    await (await contract.withdraw(balance)).wait();
    
    balance = await contract.getBalance(account);
    console.log(`${account} balance :  ${balance}`);
}
  

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
