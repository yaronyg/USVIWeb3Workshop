# USVIWeb3Workshop
Materials for a summer workshop at USVI on Web 3.0

# Install
1. Install your favorite git client (e.g. head over to https://git-scm.com/downloads and pick something for your platform)
2. Open up your favorite git client (on windows you can go to the start bar and choose "git bash")
3. Install Node.js LTS for your platform (https://nodejs.org/en/download/)
3. Navigate inside your shell with git support to where you want to keep the directory
4. Issue the "git clone https://github.com/yaronyg/USVIWeb3Workshop.git" to create a local clone of the directory
5. Issue the command "npm install -g truffle" to install the truffle framework.
5. Go over to http://truffleframework.com/ganache and download ganache for your platform as well
5. Head over to https://code.visualstudio.com/ and download and install Visual Studio Code
6. Open up Visual Studio code and select file->open folder and navigate to the USVIWeb3Workshop directory and select it and open
7. Go to Extensions (it's one of the icons on the left hand side bar) and see if you have the extension called "solidity" if you don't then type in it's name and install it. It's the one by Juan Blanco.

# Let's talk a bit about Truffle and Ganache
1. A quick look at Migrations.sol
2. Let's start Ganache, it should show up as an app

# Let's talk about Solidity
1. A walk through of contracts/Launcher.sol
2. Go to Terminal, set the default directory to your root (e.g. USVIWeb3Workshop folder)
3. Type in "truffle compile"
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
4. Go to your browser (either Edge of Chrome to make things easy) and head over to https://metamask.io/ and click on Download now
5. [Go through all the metamask fun here on a fresh install]
6. Go to Terminal and type in "npm run dev"
7. In MetaMask select Account1 (it really doesn't matter) and click Next and then Connect
8. Click on "Launch!" and when Metamask comes up hit "Confirm"
9. Go to "Amount to Pledge" entere "1000" and hit "Pledge!" and when MetaMask comes up hit "Confirm"
10. Hit Resolve Contract and if you don't get a warning that you are too early (if you do, wait 5 or 10 seconds and try again) then hit Confirm
11. Congrats! You just successfully ran a full dApp scenario!
