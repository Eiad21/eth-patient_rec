// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PatientLedger{
    uint public infoCount = 0;

    constructor() public {
        createPatientRecord("Btngana Kbeera", true, 24, 42, 5, 1000);
    }

    struct PatientRecord{
        uint patientId;
        string name;
        bool sex;
        uint height;
        uint weight;
        uint age;
        uint bloodPressure;
    }


    mapping (uint => PatientRecord) public patientRecords;

    function createPatientRecord(string memory _name, 
        bool _sex, uint _height, uint _weight,
        uint _age, uint _bloodPressure) public {
        
        infoCount++;
        patientRecords[infoCount] = PatientRecord(infoCount, _name, _sex, _height, 
                                        _weight, _age, _bloodPressure);

        // emit TaskCreated(taskCount, _content, false);
    }
}