const PreviewUrlShortener = artifacts.require("PreviewUrlShortener");

module.exports = function (deployer) {
  deployer.deploy(PreviewUrlShortener);
};