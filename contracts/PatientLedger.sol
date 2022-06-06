// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PatientLedger{
    uint public infoCount = 0;

    constructor() public {
        createPatientRecord(2,3,"Btngana Kbeera", "true", "24", "42", "5", "1000");
    }

    struct PatientRecord{
        uint patientId;
        uint myPrevRecord;
        string name;
        string sex;
        string height;
        string weight;
        string age;
        string bloodPressure;
    }


    mapping (uint => PatientRecord) public patientRecords;

    function createPatientRecord(uint _patientId, uint _myPrevRecord, 
    string memory _name, string memory _sex, string memory _height, 
    string memory _weight, string memory _age, string memory _bloodPressure) 
    public {
        
        infoCount++;
        patientRecords[infoCount] = PatientRecord(_patientId, _myPrevRecord, 
        _name, _sex, _height, _weight, _age, _bloodPressure);

        // emit TaskCreated(taskCount, _content, false);
    }
}