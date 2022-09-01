//Note that the filename is prefixed with a number and is suffixed by a description. The numbered prefix is required in order to record whether the migration ran successfully.
//The suffix is purely for human readability and comprehension.


//At the beginning of the migration, we tell Truffle which contracts we'd like to interact with via the artifacts.require() method.
const Donator = artifacts.require("Donator.sol");

//All migrations must export a function via the module.exports syntax. The function exported by each migration should accept a deployer object as its first parameter.
//This object aides in deployment by both providing a clear syntax for deploying smart contracts as well as performing some of deployment's more mundane duties, such as
//saving deployed artifacts for later use. The deployer object is your main interface for staging deployment task.
module.exports = function (deployer) {
    //Your migration files will use the deployer to stage deployment tasks. As such, you can write deployment tasks synchronously and they'll be executed in the correct order.
    deployer.deploy(Donator);    
}