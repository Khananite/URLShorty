const Purchaser = artifacts.require("Purchaser");

module.exports = function (deployer) {
  deployer.deploy(Purchaser);
};