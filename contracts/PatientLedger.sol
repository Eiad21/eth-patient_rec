// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PatientLedger{
    uint public infoCount = 0;

    constructor() public {
        // createPatientRecord(2,3,"Btngana Kbeera", "true", "24", "42", "5", "1000");
    }

    struct PatientRecord{
        uint patientId;
        uint myPrevRecord;
        string name_bloodPressure;
        string height_pulse;
        string weight_glucose;
        string age;
        string myHash;
    }


    mapping (uint => PatientRecord) public patientRecords;

    // function createPatientRecord(uint _patientId, uint _myPrevRecord, 
    // string memory _name, string memory _height, 
    // string memory _weight, string memory _age, string memory _bloodPressure
    // , string memory _pulse, string memory _glucose) 
    // public {
        
    //     infoCount++;
    //     patientRecords[infoCount] = PatientRecord(_patientId, _myPrevRecord, 
    //     _name, _height, _weight, _age
    //     , _bloodPressure, _pulse, _glucose);

    //     // emit TaskCreated(taskCount, _content, false);
    // }

    function createRecord(uint _patientId, uint _myPrevRecord, 
    string memory _name_bloodPressure, string memory _height_pulse,
    string memory _weight_glucose, string memory _age, string memory _myHash)  
    public {
        
        infoCount++;
        patientRecords[infoCount] = PatientRecord(_patientId, _myPrevRecord, 
        _name_bloodPressure, _height_pulse, _weight_glucose, _age, _myHash);

        // emit TaskCreated(taskCount, _content, false);
    }

}