// const { CryptoJS } = require('node-cryptojs-aes');

function hashCode(string) {
  var hash = 0, i, chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr   = string.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function sign(message){
  return hashCode(message)
}

function verify(message, signature){
  h = hashCode(message)
  return (h == signature)
}

App = {
    loading: false,
    contracts: {},
  
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {

      const Web3 = require('web3');
      // const EncryptRsa = require('encrypt-rsa').default;
      // const encryptRsa = new EncryptRsa();
      // console.log(encryptRsa)

      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0]
      web3.eth.defaultAccount = App.account;
      console.log(App.account)
    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const patientLedger = await $.getJSON('PatientLedger.json')
      App.contracts.PatientLedger = TruffleContract(patientLedger)
      App.contracts.PatientLedger.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.patientLedger = await App.contracts.PatientLedger.deployed()
    },

    render: async() =>{
      // Prevent double render
      if (App.loading) {
        return
      }

      // Update app loading state
      App.setLoading(true)

      // Render Account
      $('#account').html(App.account)

      // Render Tasks
      // await App.renderRecords()

      // Update loading state
      App.setLoading(false)

    },

    createPatient: async () =>{

      App.setLoading(true)

      // RETRIEVE VALUES
      
      const patientId = $('#patientIdPatient').val()

      myPrev = await App.findMyPrev(patientId)
      
      if(myPrev != 0){
        window.alert("A patient record already exists")
        window.location.reload()
        return
      }

      const name = $('#name').val()
      const height = $('#height').val()
      const weight = $('#weight').val()
      const age = $('#agePatient').val()
      const patientKey = $('#patientKeyPatient').val()
      
      var message = name+height+weight+age

      // const signatureKarim = await web3.eth.sign(App.account, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", console.log)
      // console.log("Aho et. al",signatureKarim)
      // console.log("Aho et. al tany",App.account)

      const signature = sign(message).toString();

      console.log("message ",message)
      console.log("hash ",signature)

      // PROCESS
      var nameE = CryptoJS.AES.encrypt(name, patientKey).toString();
      var heightE = CryptoJS.AES.encrypt(height, patientKey).toString();
      var weightE = CryptoJS.AES.encrypt(weight, patientKey).toString();
      var ageE = CryptoJS.AES.encrypt(age, patientKey).toString();
      var signatureE = CryptoJS.AES.encrypt(signature, patientKey).toString();
      // var allParams = name+height+
      // const signature = await web3.eth.sign(, App.account);
      
      await App.patientLedger.createRecord(patientId, myPrev, nameE, heightE, weightE, ageE, signatureE)
      
      
      console.log("ADDED PATIENT")
      console.log("patient ID: ",patientId)
      console.log("Prev: ",myPrev)
      console.log("name: ",nameE)
      console.log("height: ",heightE)
      console.log("weight: ",weightE)
      console.log("age: ",ageE)
      console.log("signature: ",signatureE)

      window.location.reload()
    },

    createVisit: async () =>{

      App.setLoading(true)

      // RETRIEVE VALUES
      
      const patientId = $('#patientIdVisit').val()

      myPrev = await App.findMyPrev(patientId)
      console.log(myPrev)
      if(myPrev === 0){
        window.alert("This patient is not registered")
        window.location.reload()
        return
      }

      const age = $('#ageVisit').val()
      const bloodPressure = $('#bloodPressure').val()
      const pulse = $('#pulse').val()
      const glucose = $('#glucose').val()
      const patientKey = $('#patientKeyVisit').val()

      var message = bloodPressure+pulse+glucose+age
      const signature = sign(message).toString();

      console.log("message ",message)
      console.log("hash ",signature)

      // PROCESS
      var ageE = CryptoJS.AES.encrypt(age, patientKey).toString();
      var bloodPressureE = CryptoJS.AES.encrypt(bloodPressure, patientKey).toString();
      var pulseE = CryptoJS.AES.encrypt(pulse, patientKey).toString();
      var glucoseE = CryptoJS.AES.encrypt(glucose, patientKey).toString();
      var signatureE = CryptoJS.AES.encrypt(signature, patientKey).toString();

      console.log("ADDED VISIT")
      console.log("patient ID: ",patientId)
      console.log("Prev: ",myPrev)
      console.log("age: ",ageE)
      console.log("bloodPressure: ",bloodPressureE)
      console.log("pulse: ",pulseE)
      console.log("glucose: ",glucoseE)
      console.log("signature: ",signatureE)

      
      await App.patientLedger.createRecord(patientId, myPrev, bloodPressureE, pulseE, glucoseE, ageE, signatureE)
      window.location.reload()
    },

    retrievePatients: async () =>{
      const patientId = $('#IdRet').val()
      const patientKey = $('#KeyRet').val()
      myPrev = await App.findMyPrev(patientId)

      const $patientTemplate = $('.patientTemplate').last()
      const $visitTemplate = $('.visitTemplate').last()
      $('#patientList').empty()
      $('#visitList').empty()
      while(myPrev> 0){
        const patRec = await App.patientLedger.patientRecords(myPrev)

        // GET DATA EL RAGEL
        const pID = patRec[0].toNumber()
        const pPrev = patRec[1].toNumber()
        const pName_BloodPressure = patRec[2]
        const pHeight_Pulse = patRec[3]
        const pWeight_Glucose = patRec[4]
        const pAge = patRec[5]
        const pSig = patRec[6]        

        // EL RAGEL DA PATIENT RECORD
        if(pPrev == 0){

          console.log("Retrieving patient data")

          // GET BYTES EL RAGEL
          const nameByte = CryptoJS.AES.decrypt(pName_BloodPressure, patientKey);
          const heightByte = CryptoJS.AES.decrypt(pHeight_Pulse, patientKey);
          const weightByte = CryptoJS.AES.decrypt(pWeight_Glucose, patientKey);
          const ageByte = CryptoJS.AES.decrypt(pAge, patientKey);
          const sigByte = CryptoJS.AES.decrypt(pSig, patientKey);

          // DECRYPT EL RAGEL

          try{
            var nameDec = nameByte.toString(CryptoJS.enc.Utf8);
            var heightDec = heightByte.toString(CryptoJS.enc.Utf8);
            var weightDec = weightByte.toString(CryptoJS.enc.Utf8);
            var ageDec = ageByte.toString(CryptoJS.enc.Utf8);
            var sigDec = sigByte.toString(CryptoJS.enc.Utf8);


            message = nameDec+heightDec+weightDec+ageDec

            console.log("hash is good", message)
            console.log("hash is good", sign(message))
            console.log("hash is good", sigDec)

            if(sign(message) == sigDec){
              console.log("Hash Match")
            }
            else{
              // InshaAllah mnd5olsh hena hahaha
              window.alert("No Hash Match")
            }

          }catch(e){
            window.alert("Coudln't retrieve data")
            window.location.reload()
            return
          }
          

          // CREATE HTML FOR EL RAGEL
          $patientTemplate.find('.pID').html(pID)
          $patientTemplate.find('.pPrev').html(pPrev)
          $patientTemplate.find('.pName').html(nameDec)
          $patientTemplate.find('.pHeight').html(heightDec)
          $patientTemplate.find('.pWeight').html(weightDec)
          $patientTemplate.find('.pAge').html(ageDec)

          $('#patientList').append($patientTemplate)
          $patientTemplate.show()
        }

        // EL RAGEL DA VISIT
        else{

          console.log("Retrieving visit data")
          // GET BYTES EL RAGEL
          const bloodPressureByte = CryptoJS.AES.decrypt(pName_BloodPressure, patientKey);
          const pulseByte = CryptoJS.AES.decrypt(pHeight_Pulse, patientKey);
          const glucoseByte = CryptoJS.AES.decrypt(pWeight_Glucose, patientKey);
          const ageByte = CryptoJS.AES.decrypt(pAge, patientKey);
          const sigByte = CryptoJS.AES.decrypt(pSig, patientKey);

          // DECRYPT EL RAGEL
          // var bloodPressureDec = null
          // var pulseDec = null
          // var glucoseDec = null
          // var ageDec = null
          try{
            var bloodPressureDec = bloodPressureByte.toString(CryptoJS.enc.Utf8);
            var pulseDec = pulseByte.toString(CryptoJS.enc.Utf8);
            var glucoseDec = glucoseByte.toString(CryptoJS.enc.Utf8);
            var ageDec = ageByte.toString(CryptoJS.enc.Utf8);
            var sigDec = sigByte.toString(CryptoJS.enc.Utf8);

            message = bloodPressureDec+pulseDec+glucoseDec+ageDec

            console.log("hash is good", message)
            console.log("hash is good", sign(message))
            console.log("hash is good", sigDec)

            if(sign(message) == sigDec){
              console.log("Hash Match")
            }
            else{
              // InshaAllah mnd5olsh hena hahaha
              window.alert("No Hash Match")
            }

          }catch(e){
            console.log("bttsya kbeera")
            window.alert("Couldn't retrieve data")
            window.location.reload()
            return
          }
          

          // CREATE HTML FOR EL RAGEL
          const $newVisitTemplate = $visitTemplate.clone()

          $newVisitTemplate.find('.pID').html(pID)
          $newVisitTemplate.find('.pPrev').html(pPrev)
          $newVisitTemplate.find('.pBloodPressure').html(bloodPressureDec)
          $newVisitTemplate.find('.pPulse').html(pulseDec)
          $newVisitTemplate.find('.pGlucose').html(glucoseDec)
          $newVisitTemplate.find('.pAge').html(ageDec)

          // PUT THE RAGEL IN THE LIST
          $('#visitList').append($newVisitTemplate)

          // SHOW THE RAGEL
          $newVisitTemplate.class = "bttsya"
          $newVisitTemplate.show()
        }

        myPrev = pPrev

      }
    },
    findMyPrev: async (id) => {

      const patientCount = await App.patientLedger.infoCount()
      for (var i = patientCount; i > 0; i--) {

        const patRec = await App.patientLedger.patientRecords(i)
        const pID = patRec[0].toNumber()

        if(pID == id){
          if (typeof i === 'number'){
            return i
          }
          else{
            return i.toNumber()
          }
        }

      }
      return 0
    },
    renderRecords: async () => {
      // Load the total task count from the blockchain
      const patientCount = await App.patientLedger.infoCount()
      const $patientTemplate = $('.patientTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= patientCount; i++) {
        // Fetch the task data from the blockchain
        // TODO: remove todo
        const patRec = await App.patientLedger.patientRecords(i)
        
        const pID = patRec[0].toNumber()
        const pPrev = patRec[1]
        const pName = patRec[2]
        const pSex = patRec[3]
        const pHeight = patRec[4]
        const pWeight = patRec[5]
        const pAge = patRec[6]
        const pBloodPressure = patRec[7]
        
        // Create the html for the task
        const $newPatientTemplate = $patientTemplate.clone()
        $newPatientTemplate.find('.pID').html(pID)
        $newPatientTemplate.find('.pName').html(pName)
        $newPatientTemplate.find('.pSex').html(pSex)
        $newPatientTemplate.find('.pHeight').html(pHeight)
        $newPatientTemplate.find('.pWeight').html(pWeight)
        $newPatientTemplate.find('.pAge').html(pAge)
        $newPatientTemplate.find('.pBloodPressure').html(pBloodPressure)
                        // .on('click', App.toggleCompleted)
  
        // Put the task in the correct list
        $('#patientList').append($newPatientTemplate)
  
        // Show the task
        $newPatientTemplate.show()

      }
    },

    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  
}
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })
  


  