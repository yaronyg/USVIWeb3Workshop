const Launcher = artifacts.require("Launcher");
const BN = web3.utils.BN;
const requestDelayInMs = 100;

// valueToSpend is positive when we are spending wei and negative when we
// expect to get credited wei.
async function testGasAmount(account, valueToSpend, funcToCall) {
    const originalAccountBalance = new BN(await web3.eth.getBalance(account, "latest"));
    const tx = await funcToCall();
    const resultingAccountBalance = new BN(await web3.eth.getBalance(account, "latest"));
    const gas = new BN(tx.receipt.cumulativeGasUsed);
    const gasPrice = new BN(await web3.eth.getGasPrice());
    const weiSpentOnGas = gas.mul(gasPrice);
    assert.ok(resultingAccountBalance.add(weiSpentOnGas).add(valueToSpend).sub(originalAccountBalance).eq(new BN(0)));
    return tx;
}

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
            const testAccount = accounts[0];
            const tx = await testGasAmount(testAccount, new BN(0), () => {
                return launcher.createLaunch(3, fundingGoal, {from: testAccount});
            });
            console.log("passed createLaunch")
            const { logs } = tx;
            assert.ok(Array.isArray(logs));
            assert.equal(logs.length, 1);
            const log = logs[0];
            assert.equal(log.event, 'LaunchCreated');
            const launchID = log.args.launchID;
            
            await testGasAmount(testAccount, fundingGoal, () => {
                return launcher.pledge(launchID, { value: fundingGoal, from: testAccount});
            });
            console.log("passed pledge");

            const gotLaunchInfo = await launcher.launches.call(launchID, {from: testAccount});
            console.log("Passed launches query");
            assert.equal(gotLaunchInfo.contractState, Launcher.ContractState.TimeNotExpired);
            assert.ok(new BN(gotLaunchInfo.launchGoalInWei).eq(fundingGoal));
            assert.ok(new BN(gotLaunchInfo.totalCommittedWei).eq(fundingGoal));

            // Wait for contract timeout
            await timeout(3000);
        
            let totalCommittedWei = await launcher.getPledge(launchID, {from: testAccount});
            console.log("passed getPledge");
            assert.ok(totalCommittedWei.eq(fundingGoal));
            await testGasAmount(testAccount, fundingGoal.mul(new BN(-1)), () => {
                return launcher.claimPledges(launchID, {from: testAccount});
            });
            console.log("passed claimPledges");
        });
    });
});