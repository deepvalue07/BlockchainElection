pragma solidity 0.5.16;

contract Election {

    struct Candidate {
        uint id;
        uint voteCount;
        string name;
    } 

    mapping (uint => Candidate) public candidates;
    uint public candidatesCount;
    mapping (address => bool) public voters;

    constructor() public {
        addCandidate("Kamal Hassan");
        addCandidate("Rajnikanth");
    }

     function addCandidate( string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount,0,_name);
    }

    function addVote(uint _candidateId) public {
        require(!voters[msg.sender]);

        require(_candidateId > 0 && candidates[_candidateId].id <= candidatesCount);
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }

    function hasVoted () external view returns (bool){
        return voters[msg.sender];
    }
}