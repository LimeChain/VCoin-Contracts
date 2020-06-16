const etherlime = require('etherlime-lib');

const VCoin = require('../build/VCoin.json');

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

const deploy = async (network, secret) => {
    const deployer = DEPLOYERS[ENV](secret, network);
    const contract = await deployer.deploy(VCoin);

    const mintTx = await contract.mint(contract.contractAddress, 5);
    await deployer.provider.waitForTransaction(mintTx.hash)

    console.log(contract.contractAddress);
    console.log(await contract.balanceOf(contract.contractAddress));
}

(async () => {
    await deploy();
})();

