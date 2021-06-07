const Launcher = artifacts.require("Launcher");
const BN = web3.utils.BN;
const requestDelayInMs = 100;

// async function testGasAmount(account, fundingGoal, funcToCall) {
//     //const originalAccountBalance = new BN(await web3.eth.getBalance(account));
//     const tx = await funcToCall();
//     //const resultingAccountBalance = new BN(await web3.eth.getBalance(account));
//     // const gas = new BN(tx.receipt.cumulativeGasUsed);
//     // const gasPrice = new BN(await web3.eth.getGasPrice());
//     // const weiSpentOnGas = gas.mul(gasPrice);
//     // const accountForCosts = resultingAccountBalance.add(weiSpentOnGas).sub(fundingGoal);
//     // const shouldBeEqual = originalAccountBalance.sub(accountForCosts);
//     // const errorRangeInWei = new BN(2000); 
//     // assert.ok(shouldBeEqual.abs().lte(errorRangeInWei), "testGasAmount: shouldBeEqual" + shouldBeEqual.toString(10));
// }

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

contract("Launcher", (accounts) => {
    let launcher;

    before(async () => {
        launcher = await Launcher.deployed();
    });

    describe("Create a new launch", async () => {
        const fundingGoal = new BN(1000);

        it("Create launch, single pledge to fullfill", async () => {
            const tx = await launcher.createLaunch(3, fundingGoal);
            console.log("passed createLaunch")
            const { logs } = tx;
            assert.ok(Array.isArray(logs));
            assert.equal(logs.length, 1);
            const log = logs[0];
            assert.equal(log.event, 'LaunchCreated');
            const launchID = log.args.launchID;
            
            await launcher.pledge(launchID, { value: fundingGoal });
            console.log("passed pledge");

            const gotLaunchInfo = await launcher.launches.call(launchID, {from: accounts[0]});
            console.log("Passed launches query");
            assert.equal(gotLaunchInfo.contractState, Launcher.ContractState.TimeNotExpired);
            assert.ok(new BN(gotLaunchInfo.launchGoalInWei).eq(fundingGoal));
            assert.ok(new BN(gotLaunchInfo.totalCommittedWei).eq(fundingGoal));

            // Wait for contract timeout
            await timeout(3000);
        
            let totalCommittedWei = await launcher.getPledge(launchID);
            console.log("passed getPledge");
            assert.ok(totalCommittedWei.eq(fundingGoal));
            await launcher.claimPledges(launchID);
            console.log("passed claimPledges");
        })
    });
});