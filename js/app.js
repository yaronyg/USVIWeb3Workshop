App = {
  web3Provider: null,
  contracts: {},
  launchID: null,
  statusDesc: null,
  timeUntilLaunchExpires: null,
  totalWeiAskedFor: null,
  totalWeiPledged: null,

  init: async function() {
    App.statusDesc = $('#statusDesc');
    App.timeUntilLaunchExpires = $('#timeUntilLaunchExpires');
    App.totalWeiAskedFor = $('#totalWeiAskedFor');
    App.totalWeiPledged = $('#totalWeiPledged');
    App.currentLaunchID = $('#currentLaunchID');

    App.statusDesc.text("Calling initWeb3");

    return App.initWeb3();
  },

  initWeb3: async function() {
    if (!window.ethereum) {
      console.error("Please install metamask");
    }
    try {
      await window.ethereum.request({method: 'eth_requestAccounts'});
    } catch (error) {
      console.error("User denied account access or something - " + error);
    }
    window.web3 = new Web3(window.ethereum);
    window.BN = web3.utils.BN;

    return App.initContract();
  },

  initContract: function() {
    App.statusDesc.text("Calling initContract");

    $.getJSON('build/contracts/Launcher.json', function(LauncherArtifact) {
      // Read in the contract file definition
      App.contracts.Launcher = TruffleContract(LauncherArtifact);

      //Set the provider for the contract
      return App.contracts.Launcher.setProvider(window.ethereum);
    })

    App.subscribeToUpdate();
    return App.bindEvents();
  },

  updateStatus: async() => {
    if (App.launchID == null) {
      return;
    }

    const launcherInstance = await App.contracts.Launcher.deployed();
    let launch;
    try {
      launch = await launcherInstance.launches.call(App.launchID);
    } catch(error) {
      console.error("Something bad happened in update stauts: " + JSON.stringify(error));
      return;
    }
    
    const launchTimeInSecondsSinceEpoch = launch.launchTime.toNumber();
    const launchTimeInHumanForm = new Date(launchTimeInSecondsSinceEpoch * 1000).toString();

    App.timeUntilLaunchExpires.text(launchTimeInHumanForm);
    App.totalWeiAskedFor.text(launch.launchGoalInWei.toString(10));
    App.totalWeiPledged.text(launch.totalCommittedWei.toString(10));
  },

  subscribeToUpdate: () => {
    window.web3.eth.subscribe('newBlockHeaders').on('data', () => {
      App.updateStatus();
    });
  },

  launchFundRaising: async () => {
    App.statusDesc.text("Calling launchFundRaising");

    const launcherInstance = await App.contracts.Launcher.deployed();
    App.statusDesc.text("Contract Launched");

    const fundingGoal = new BN(1000);
    const launchTimeInSeconds = new BN(30);

    const tx = await launcherInstance.createLaunch(launchTimeInSeconds, fundingGoal, {from: web3.eth.currentProvider.selectedAddress});

    const { logs } = tx;
    const log = logs[0];

    App.statusDesc.text("Waiting for launch to reach ignition");
    App.launchID = log.args.launchID.toNumber();
    App.currentLaunchID.text(App.launchID);
    await App.updateStatus();
  },

  pledge: async () => {
    const launcherInstance = await App.contracts.Launcher.deployed();
    try {
      const pledgeAmount = new BN($('#pledge').val());
      await launcherInstance.pledge(App.launchID, 
        {from: web3.eth.currentProvider.selectedAddress,
         value: pledgeAmount});
    } catch(error) {
      App.statusDesc.text("Contract probably already closed - " + JSON.stringify(error));
    }
  },

  // Returns contract state as a number, not a BN
  setContractState: async () => {
    const launcherInstance = await App.contracts.Launcher.deployed();

    const launch = await launcherInstance.launches(App.launchID);

    // Get the "right" value for contractState, remember it won't be updated in the
    // contract until somebody pays to do it.
    if (launch.contractState.toNumber() != App.contracts.Launcher.ContractState.TimeNotExpired) {
      return launch.contractState.toNumber();
    } else if (launch.launchTime.lte(new BN(Date.now()/1000))) { //Date.now is in ms but launchtime is in seconds
      // So we know the contract should be expired but nobody has called a mutation method yet
      // Or we could have clock skew
      return launch.totalCommittedWei.gte(launch.launchGoalInWei) ?
        App.contracts.Launcher.ContractState.Funded :
        App.contracts.Launcher.ContractState.NotFunded;
    } else {
      return launch.contractState.toNumber();
    }
  },

  processBeneficiary: async () => {
    const launcherInstance = await App.contracts.Launcher.deployed();

    const launch = await launcherInstance.launches(App.launchID);

    const contractState = await App.setContractState();

    if (launch.beneficiary.toLowerCase() != web3.eth.currentProvider.selectedAddress.toLowerCase()) {
      return false;
    }

    switch (contractState) {
      case App.contracts.Launcher.ContractState.NotFunded:
        const pledge = await launcherInstance.getPledge(App.launchID)
        if (pledge.lte(new BN(0))) {
          App.statusDesc.text("Contract did not fund and you have no outstanding pledge money.");
          return true;
        }

        try {
          await launcherInstance.refundPledge(App.launchID, {from: web3.eth.currentProvider.selectedAddress});
          App.statusDesc.text("Contract did not fund and we have now refunded your pledge money.");
        } catch (error) {
          App.statusDesc.text("Something went very wrong in beneficiary refundPledge - " + JSON.stringify(error));
        }
        return true;
      case App.contracts.Launcher.ContractState.Funded:
        if (launch.totalCommittedWei.lte(new BN(0))) {
          App.statusDesc.text("Contract funded but you already claimed the pledges");
          return true;
        }
        try {
          await launcherInstance.claimPledges(App.launchID, {from: web3.eth.currentProvider.selectedAddress});
          App.statusDesc.text("Contract funded and we just claimed your pledges!!!!!");
        } catch (error) {
          App.statusDesc.text("Something went very wrong in beneficiary claimPledges");
        }
        return true;
      default:
        console.error("We have an impossible contractState in beneficiary: " + contractState);
        return true;
    }
  },

  processPledger: async () => {
    const launcherInstance = await App.contracts.Launcher.deployed();

    const launch = await launcherInstance.launches(App.launchID);

    const contractState = await App.setContractState();

    if (launch.beneficiary.toLowerCase() == web3.eth.currentProvider.selectedAddress.toLowerCase()) {
      return false;
    }
    switch (contractState) {
      case App.contracts.Launcher.ContractState.NotFunded:
        const pledge = await launcherInstance.getPledge(App.launchID);
        if (pledge.lte(new BN(0))) {
          App.statusDesc.text("Contract was not funded and you either didn't pledge or already reclaimed your pledge");
          return true;
        }
        try {
          await launcherInstance.refundPledge(App.launchID, {from: web3.eth.currentProvider.selectedAddress});
          App.statusDesc.text("Contract was not funded and we reclaimed your pledge");
        } catch (error) {
          App.statusDesc.text("Something went very wrong in pledger refundPledge");
        }
        return true;
      case App.contracts.Launcher.ContractState.Funded:
        App.statusDesc.text("Contract was funded but you aren't the beneficiary!");
        return true;
      default:
        console.error("We have an impossible contractState in pledger: " + contractState);
        return true;
    }
  },

  resolve: async () => {
    if (App.launchID == null) {
      App.statusDesc.text("BBBBBZZZZZZ -- PLEASE LAUNCH THE CONTRACT FIRST");
      return;
    }

    const contractState = await App.setContractState();

    if (contractState == App.contracts.Launcher.ContractState.TimeNotExpired) {
      App.statusDesc.text("BBBBBZZZZZ - TOO SOON! TRY AGAIN LATER!");
      return;
    }

    if (await App.processBeneficiary()) {
      return;
    }

    if (await App.processPledger() == false) {
      App.statusDesc.text("Something went wrong, you aren't a beneficiary or a pledger or someone changed metamask really fast!");
    }    
  },

  bindEvents: function() {
    $(document).on('click', '.btn-launch', App.launchFundRaising);
    App.statusDesc.text("Now hit the Launch! button");
    $(document).on('click', '.btn-pledge', App.pledge);
    $(document).on('click', '.btn-resolve', App.resolve);
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
