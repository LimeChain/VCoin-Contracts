const etherlime = require('etherlime-lib');

const VCoin = require('../build/VCoin.json');
const MultiSigWallet = require('../build/MultiSigWallet.json');

const ENV = 'LOCAL';
const DEPLOYERS = {
    LOCAL: (secret) => {
        return new etherlime.EtherlimeGanacheDeployer(secret, 8545, '')
    },
    TEST: (secret, network) => {
        const INFURA_PROVIDER = '14ac2dd6bdcb485bb22ed4aa76d681ae'
        return new etherlime.InfuraPrivateKeyDeployer(secret, network, INFURA_PROVIDER)
    }
};

const CONFIRMATIONS = 1;

const deploy = async (network, secret) => {
    const deployer = DEPLOYERS[ENV](secret, network);
    const signerAddress = await deployer.signer.getAddress();

    const tokenContract = await deployer.deploy(VCoin);
    const walletContract = await deployer.deploy(MultiSigWallet, {}, [signerAddress], CONFIRMATIONS);

    const minterRole = await tokenContract.MINTER_ROLE();

    // Assign minter role to wallet
    const grantRoleTx = await tokenContract.grantRole(minterRole, walletContract.contractAddress);
    await deployer.provider.waitForTransaction(grantRoleTx.hash);

    // Revoke deployer access
    const revokeMinterTx = await tokenContract.revokeRole(minterRole, signerAddress);
    await deployer.provider.waitForTransaction(revokeMinterTx.hash)
}

module.exports = { deploy }
