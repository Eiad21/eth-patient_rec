// const { CryptoJS } = require('node-cryptojs-aes');

function compress(string, key) {
  string = unescape(encodeURIComponent(string));
  var newString = '',
    char, nextChar, combinedCharCode;
  for (var i = 0; i < string.length; i += 2) {
    char = string.charCodeAt(i);

    if ((i + 1) < string.length) {

      
      nextChar = string.charCodeAt(i + 1) - 31;
      key+=1
      
      combinedCharCode = char + "" + nextChar.toLocaleString('en', {
        minimumIntegerDigits: 2
      });

      newString += String.fromCharCode(parseInt(combinedCharCode, 10));

    } else {

     
      newString += string.charAt(i);
    }
  }
  return btoa(unescape(encodeURIComponent(newString)));
}


function decompress(string, key) {

  var newString = '',
    char, codeStr, firstCharCode, lastCharCode;
  string = decodeURIComponent(escape(atob(string)));
  for (var i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    if (char > 132) {
      codeStr = char.toString(10);

      firstCharCode = parseInt(codeStr.substring(0, codeStr.length - 2), 10);
      key+=1
      lastCharCode = parseInt(codeStr.substring(codeStr.length - 2, codeStr.length), 10) + 31;

      newString += String.fromCharCode(firstCharCode) + String.fromCharCode(lastCharCode);
    } else {
      newString += string.charAt(i);
    }
  }
  return newString;
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
      // const CryptoJS = require('crypto-js')
      const Web3 = require('web3');

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
      await App.renderRecords()

      // Update loading state
      App.setLoading(false)

    },

    createRecord: async () =>{

      App.setLoading(true)

      // INIT
      var password = "myPassword";

      // RETRIEVE VALUES
      
      const patiendId = $('#patiendId').val()
      const name = $('#name').val()
      const sex = $('#sex').is(':checked')
      const height = $('#height').val()
      const weight = $('#weight').val()
      const age = $('#age').val()
      const bloodPressure = $('#bloodpressure').val()
      
      // PROCESS
      var nameE = CryptoJS.AES.encrypt(name, password).toString();
      var sexE = CryptoJS.AES.encrypt(sex, password).toString();
      var heightE = CryptoJS.AES.encrypt(height, password).toString();
      var weightE = CryptoJS.AES.encrypt(weight, password).toString();
      var ageE = CryptoJS.AES.encrypt(age, password).toString();
      var bloodPressureE = CryptoJS.AES.encrypt(bloodPressure, password).toString();

      console.log("patient ID: ",patiendId)
      console.log("name: ",nameE)
      console.log("sex: ",sexE)
      console.log("height: ",heightE)
      console.log("weight: ",weightE)
      console.log("age: ",ageE)
      console.log("bloodPressure: ",bloodPressureE)
      
      
      // GET PREVIOUS
      var prev = -1

      
      await App.patientLedger.createPatientRecord(patiendId, prev, nameE, sexE, heightE, weightE, ageE, bloodPressureE)
      window.location.reload()
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
  