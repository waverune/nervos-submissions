pragma solidity >=0.8.0;

contract PostBoard {

  string greet;
  uint base = 10;
  uint randMod = 16;      // uuid digit length
  uint tc;                // postCount

  struct Post{
    uint uuid;
    string content;
    string title;
  }


  Post[] public posts;
  uint[] public postsEndTime;  // indexed by post id  //byte could be tried array ??
  mapping(uint => address) postToOwner;
  mapping(address => uint) ownerPostCount;

  constructor(string memory _greet) {
    tc = 0;
    createPost(999," init Paste","init title");

    // owners greet just checking getters and setters
    greet = _greet;
  }

  /// methods
  function createPost(uint _endTime, string memory _content, string memory _title) public{
    //  uint _postId = posts.push( Post( _generateUUID(_content), _content, _title) ) - 1 ; // earlier push used to return length
    posts.push( Post( _generateUUID(_content), _content, _title) ) ; //
    uint _postId = posts.length;
    postsEndTime.push(uint(block.timestamp  + (_endTime*86400)));      // now is deprecated  so,block.timestamp is used
    postToOwner[_postId] = msg.sender;
    ownerPostCount[msg.sender]++;
    tc++;
  }

  // client side optimisation
  function getEndTimeArray() public view returns(uint[] memory){
    return postsEndTime;
  }

  //_generateUUID returns randMod digits random num;
  function _generateUUID(string memory _str) private view returns(uint){
    uint rand = uint(keccak256(abi.encodePacked(_str)));
    return  rand % (base ** randMod);
  }


  function readPostCount() public view returns(uint){
    return tc;
  }

  function setGreet(string memory _greet) public {
    greet = _greet;
  }

  function getGreet() public view returns(string memory) {
    return greet;
  }
}
