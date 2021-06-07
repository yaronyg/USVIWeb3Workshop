// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

contract Launcher {
    enum ContractState { TimeNotExpired, Funded, NotFunded }

    struct Launch {
        ContractState contractState;
        uint launchTime;
        uint launchGoalInWei;
        uint totalCommittedWei;
        address beneficiary;
        mapping (address => uint) pledges;
    }

    mapping(uint => Launch) public launches;

    uint public launchCounter;

    /// The submitted launch address doesn't match a launch campaign
    error BadLaunchAddress();

    modifier checkLaunchAddress(uint launchID) {
        if (launches[launchID].launchGoalInWei == 0) revert BadLaunchAddress();
        _;
    }

    function updateStateIfNeeded(uint launchID) internal
        checkLaunchAddress(launchID) {
        Launch storage launch = launches[launchID];

        if (launch.contractState != ContractState.TimeNotExpired ||
            block.timestamp < launch.launchTime) {
            return;
        }

        launch.contractState = 
            (launch.totalCommittedWei >= launch.launchGoalInWei) ?
                ContractState.Funded : 
                ContractState.NotFunded;
    }

    /// The state of the contract did not match the state required for this
    /// function call.
    error WrongState(ContractState contractState, ContractState expectedState);

    modifier checkState(uint launchID, ContractState expectedState) {
        updateStateIfNeeded(launchID);
        Launch storage launch = launches[launchID];
        if (expectedState != launch.contractState) revert WrongState(launch.contractState, expectedState);
        _;
    }

    /// Sender did not pledge money or has already had their pledge refunded
    error NoPledgeRefundDue();

    /// We use this value to detect references to contracts that don't exist and 
    /// besides it's silly to have a launch for 0 Wei
    error LaunchGoalMustBeGreaterThan0();

    /// We really don't need an event but I just wanted to show it's done
    event LaunchCreated(
        address beneficiary,
        uint launchTime,
        uint launchGoalInWei,
        uint launchID
    );

    function createLaunch(
            // This can be 0, in that case the fund raising is quite short :)
            uint _secondsToLaunchTime,
            // Any value is accepted since it's met or it isn't, this includes 0
            uint _launchGoalInWei) 
        public {
            if (_launchGoalInWei == 0) revert LaunchGoalMustBeGreaterThan0();
            uint launchID = launchCounter++;
            Launch storage launch = launches[launchID];
            launch.contractState = ContractState.TimeNotExpired;
            launch.launchGoalInWei = _launchGoalInWei;
            launch.launchTime = block.timestamp + _secondsToLaunchTime;
            launch.beneficiary = msg.sender;
            emit LaunchCreated(launch.beneficiary, launch.launchTime, launch.launchGoalInWei, launchID);
        }

    function pledge(uint launchID) 
        public 
        payable 
        checkState(launchID, ContractState.TimeNotExpired) {
        Launch storage launch = launches[launchID];
        // Maps treat all unintialized values as starting at 0 so we don't have to check
        // if the pledge has been set before.
        launch.pledges[msg.sender] += msg.value;
        launch.totalCommittedWei += msg.value;
    }

    // Strictly speaking the refundPledge and claimPledges functions could
    // be combined into a single "resolve" function but I like to have small
    // functions with very limited functionality and lots of testing so I put
    // the work of combining them together on the client side.

    // If the project failed to launch, get back pledge
    function refundPledge(uint launchID)
        public
        payable 
        checkState(launchID, ContractState.NotFunded) {
        Launch storage launch = launches[launchID];
        uint refund = launch.pledges[msg.sender];
        launch.pledges[msg.sender] = 0;
        launch.totalCommittedWei -= refund;
        if (refund == 0) revert NoPledgeRefundDue();
        if (!payable(msg.sender).send(refund)) {
            launch.pledges[msg.sender] = refund;
            launch.totalCommittedWei += refund;
        }
    }

    function claimPledges(uint launchID)
        public
        payable
        checkState(launchID, ContractState.Funded) {
        Launch storage launch = launches[launchID];
        require(msg.sender == launch.beneficiary, "Only the beneficiary can claim the pledges");
        uint totalFunding = launch.totalCommittedWei;
        launch.totalCommittedWei = 0;
        if (!payable(launch.beneficiary).send(totalFunding)) {
            launch.totalCommittedWei = totalFunding;
        }
    }

    function getPledge(uint launchID)
        public
        view
        checkLaunchAddress(launchID)
        returns(uint) {
        return launches[launchID].pledges[msg.sender];
    }
}