const FrontRunBot = artifacts.require("FrontRunBot");

module.exports = function (deployer) {
  deployer.deploy(FrontRunBot);
};
