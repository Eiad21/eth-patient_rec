const PatientLedger = artifacts.require("./PatientLedger.sol");

module.exports = function(deployer) {
  deployer.deploy(PatientLedger);
};
