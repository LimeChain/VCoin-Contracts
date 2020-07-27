require('dotenv').config({ path: __dirname + '/.env' });
const etherlime = require('etherlime-lib');

const chalk = require('chalk');
const consoleInput = require('prompts');

const VCoin = require('../build/VCoin.json');
const MultiSigWallet = require('../build/MultiSigWallet.json');

// Deployer is an owner by default
const deploy = async () => {
    const deployer = await obtainDeployer();
    const OWNERS = await loadOwners(deployer);

    const tokenContract = await deployer.deployAndVerify("etherscan", VCoin);
    const walletContract = await deployer.deployAndVerify("etherscan", MultiSigWallet, {}, OWNERS, process.env.CONFIRMATIONS);

    console.log(chalk.greenBright('Token contract address: '), tokenContract.contractAddress);
    console.log(chalk.greenBright('Wallet contract address: '), walletContract.contractAddress);

    /* ------------------ Prepare contracts ------------------  */
    /* -------------------------------------------------------  */
    /* -------------------------------------------------------  */
    process.stdout.write('\nPreparing contracts...\r');

    const minterRole = await tokenContract.MINTER_ROLE();
    const pauserRole = await tokenContract.PAUSER_ROLE();

    // Assign minter and pauser role to wallet
    const grantMinterRoleTx = await tokenContract.grantRole(minterRole, walletContract.contractAddress);
    const grantPauserRoleTx = await tokenContract.grantRole(pauserRole, walletContract.contractAddress);

    await deployer.provider.waitForTransaction(grantMinterRoleTx.hash);
    await deployer.provider.waitForTransaction(grantPauserRoleTx.hash);


    // Revoke deployer direct access to minting and pausing
    const revokeMinterTx = await tokenContract.revokeRole(minterRole, OWNERS[0]);
    const revokePauserTx = await tokenContract.revokeRole(pauserRole, OWNERS[0]);

    await deployer.provider.waitForTransaction(revokeMinterTx.hash);
    await deployer.provider.waitForTransaction(revokePauserTx.hash);

    process.stdout.write(chalk.greenBright('Contracts are ready to be used\n'));
}

const obtainDeployer = async function () {
    const privateKey = await consoleInput({
        type: 'text',
        name: 'value',
        message: `Enter deployer private key`
    });

    if (!process.env.NETWORK) {
        throw new Error("No network environment variable supplied")
    }

    if (!process.env.INFURA_PROVIDER) {
        throw new Error("No infura key environment variable supplied")
    }

    if (!process.env.ETHERSCAN_KEY) {
        throw new Error("No etherscan key environment variable supplied")
    }

    const INFURA_PROVIDER = process.env.INFURA_PROVIDER
    const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY
    const deployer = new etherlime.InfuraPrivateKeyDeployer(privateKey.value, process.env.NETWORK, INFURA_PROVIDER)
    deployer.setVerifierApiKey(ETHERSCAN_KEY)
    return deployer
}

const loadOwners = async function (deployer) {
    console.log(chalk.greenBright('Required number of owners: '), process.env.CONFIRMATIONS);

    const deployerAddress = await deployer.signer.getAddress();
    const owners = [deployerAddress];
    for (let i = 1; i < process.env.CONFIRMATIONS; i++) {
        const ownerAddress = await consoleInput({
            type: 'text',
            name: 'value',
            message: `Enter address of owner ${i}`
        });

        owners.push(ownerAddress.value);
    }

    return owners;
}


module.exports = { deploy }
