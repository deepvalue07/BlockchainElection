App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      console.log("Instance");
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      console.log("candidatesCount");
      var candidatesResults = $("#candidatesResults");
      var candidateListResult = $("#candidatesSelect");
      candidatesResults.empty();
      candidateListResult.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          console.log(candidate);
          var id = candidate[0];
          var voteCount = candidate[1];
          var name = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          var candidateList = "<option value=\"" + id + "\">" + name + "</option>";
          candidateListResult.append(candidateList);
        });
      }

      loader.hide();
      content.show();
    }).then(function(hasVoted){
      console.log("hasVoted");
      if(hasVoted){
        $("#form").hide();
      }
    }).catch(function(error) {
      console.log("There is error here!");
      console.log(error);
    });
  },

  castVote: function() {
    var candidateSelected = $("#candidatesSelect").val();

    App.contracts.Election.deployed().then(function(instance){
      var hasVoted = instance.hasVoted();
      if(!hasVoted){
        return instance.addVote(candidateSelected, ({from: App.account})).then(function(result){
          $("#content").hide();
          $("#loader").show();
        });
      }
      else {
        $("#content").hide();
        $("#randomText").html("You shall not pass");
      }
    }).catch(function(err){
      console.log(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

