const AdvanceStorage = artifacts.require('AdvanceStorage');

contract('AdvanceStorage',()=>{
   let advanceStorage = null;
   before(async() => {
      //we use this before function to avoid repetition of contract instance
      advanceStorage = await AdvanceStorage.deployed();
   })
   //Test1 : testing add() function of SC
   it('Should add an element to ids Array',async() => {

      //Arrange: fake data id to add it to ids[]
      var id = 101;

      //Act: calling add() by giving fake id and public ids array to check if data is stored
      await advanceStorage.add(id);
      const result = await advanceStorage.ids(0);
      
      //Assert: comparing the ids[0] with our inputed data
      //as result is BN and to convert it to number that JS can read
      assert.equal(result.toNumber(),id);
   });
   //Test2 : testing get() function of SC
   it('Should get an element of the ids Array',async() => {

      //Arrange: fake index to get data from ids[]
      var index = 1; //index is 1 as in test 1 101 is alredy added to array
      var _id = 20;

      //Act: calling add() by giving fake id and get() to check if data is stored
      await advanceStorage.add(_id);
      const result = await advanceStorage.get(index);

      //Assert: comparing the ids[0] with our inputed data
      //as result is BN and to convert it to number that JS can read
      assert.equal(result.toNumber(),_id);
   });
   //Test3 : testing getALL() function of SC
   it('Should get the ids Array',async() => {

      //Arrange: no data as we getting array
      

      //Act: calling add() by giving fake id and get() to check if data is stored
      const rawIds = await advanceStorage.getAll();
      //converting array of BIGNUMBER to array of JS
      const ids = rawIds.map(id=> id.toNumber());


      //Assert: comparing the ids[0] with our inputed data
      //deepEqual will compare elements irrespective of their ids
      assert.deepEqual(ids,[101,20]);
   });
   //Test3 : testing length() function of SC
   it('Should get the ids Array length',async() => {

      //Arrange: no data as we getting array
      

      //Act: calling add() by giving fake id and get() to check if data is stored
      const length = await advanceStorage.length();

      //Assert: comparing the ids[0] with our inputed data
      //deepEqual will compare elements irrespective of their ids
      assert.equal(length,2);
   });
 })