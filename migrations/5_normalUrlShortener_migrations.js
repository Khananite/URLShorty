const NormalUrlShortener = artifacts.require("NormalUrlShortener");

module.exports = function (deployer) {
  deployer.deploy(NormalUrlShortener);
};