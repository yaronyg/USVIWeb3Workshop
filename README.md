# USVIWeb3Workshop
Materials for a summer workshop at USVI on Web 3.0

# Install
1. Install your favorite git client (e.g. head over to https://git-scm.com/downloads and pick something for your platform, I mostly accepted the defaults)

3. Install Node.js LTS for your platform (https://nodejs.org/en/download/)

   1. I usually install X64 but it probably doesn't matter

   2. If you are installing on Windows make sure to select the option for "Automatically install the necessary tools". We'll need those tools.

5. Go over to http://truffleframework.com/ganache and download ganache for your platform as well

5. Head over to https://code.visualstudio.com/ and download and install Visual Studio Code

   1. As with Node, I tend to choose the 64 bit versions

   2. Go to Extensions (it's one of the icons on the left hand side bar) and see if you have the extension called "solidity" if you don't then type in it's name and install it. I used the one by Juan Blanco because it's popular and it seems tow ork well.

4. Go to your browser (either Edge or Chrome to make things easy) and head over to https://metamask.io/ and click on Download now and on the next page scroll down to the "Supported Browsers" section and click on the browser you are using and following the instructions to install.
   
    1. We'll give detailed instructions on how to set up MetaMask below

# Set up
1. Open up your favorite git client (on windows you can go to the start bar and choose "git bash")
3. Navigate inside your shell with git support to where you want to keep the directory
4. Issue the "git clone https://github.com/yaronyg/USVIWeb3Workshop.git" to create a local clone of the directory
5. Issue the command "npm install -g truffle" to install the truffle framework.
5. You can close the terminal window if you would like. From this point on if we say "terminal" we mean the terminal window you will open in Visual Studio Code in two sections from now.
1. Please open up Visual Studio code and select file->open folder and navigate to the USVIWeb3Workshop directory and select it and open

# Let's talk a bit about Truffle and Ganache
1. A quick look at Migrations.sol
2. Open up the Ganache App
3. Click on "New Workspace"
4. Click on "Add Project"
5. Select the truffle-config file inside of the USVIWeb3Workshop directory and click open
6. Click "Save Workspace"

# Let's talk about Solidity
1. A walk through of contracts/Launcher.sol
2. Go Visual Studio Code and select the Terminal menu item and select the new terminal
3. Type in "truffle compile"
   1. If you are on Windows and have a fresh install of everything then you'll probably get an error for the above. If the error you got wasn't "...truffle.ps1 cannot be loaded because running scripts is disabled on this system" then just close all the Visual Studio Code instances and re-open. Yes, you probably could just have created a new terminal but better to be safe than sorry.
   2. If you do get the "... truffle.ps1 cannot be loaded..." error then do the following:
      1. Run "Get-ExecutionPolicy". It probably says Restricted.
      2. I run "Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser" but you can read  https:/go.microsoft.com/fwlink/?LinkID=135170 and make your own choices.
      3. Now try "truffle compile" again.
4. Head over to build\contracts\Launcher.json

# Let's talk about migrations
1. Go to migrations/1_initial_migrations.js
2. Go to migrations/2_deploy_contracts.js
3. Go to truffle-config.js
4. Make sure Ganache is running
5. Go to Terminal and type in "truffle migrate"

# Let's look at some tests!
1. Go to test/testLauncher.test.js
2. Go to Terminal and type in "truffle test"

# Let's look at a simple dAPP
1. Go to Terminal and type "npm install"
2. Go to index.html
3. Go to js/app.js
5. Go to your browser and click on the MetaMask icon.
   1. It should open a page that says "Welcome to MetaMask", click on Get Started
   2. This should bring you to a page that says "New to MetaMask?", got to "No, I already have a seed phrase" and click on "Import wallet".
   3. Agree or not to helping to improve MetaMask
   4. Go to Ganache, select "Accounts" and you will see "MNEMONIC", copy (via your mouse or otherwise) the string of words directly underneath it.
   5. Go back to the browser and paste the words into "Seed Phrase" and enter a suitable password, repeat it, click on "I have read and agree to the Terms of Use" (once you have done so, of course) and then click Import.
   6. Accept your congratulations and click on "All Done"
   7. Feel free to hit "x" to exit the popup about What's new, in fact, you can close the whole tab if you want to
   8. Click on the MetaMask icon and you wil lsee a drop down on the top line that probably says "Ethereum Mainnet", click on that drop down and select Custom RPC
   9. Enter a network name, I usual enter Ganache, for the URL enter http://127.0.0.1:7545, for the chain ID enter 1337 (yes, really) and click save
   10. You should see a list of networks with Ganache (if that is what you named it) at the end, you can click out of that window.
6. Go to Terminal and type in "npm run dev"
7. The first time you do this it will trigger MetaMask to give you a "Connect with MetaMask" dialog, please click Next and then Connect.
8. Click on "Launch!" and when Metamask comes up hit "Confirm"
9. Go to "Amount to Pledge" enter "1000" and hit "Pledge!" and when MetaMask comes up hit "Confirm"
10. Hit Resolve Contract and if you don't get a warning that you are too early (if you do, wait 5 or 10 seconds and try again) then hit Confirm in MetaMask
11. Congrats! You just successfully ran a full dApp scenario!
