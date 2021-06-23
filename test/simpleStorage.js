// import truffle contract artifact, an object to manipulate our SC
const SimpleStorage = artifacts.require('SimpleStorage');

contract ('SimpleStorage',()=>{
      //Test 1: testing set() if it sets the value of data variable
      it('Should set the value of data variable', async()=>{

         //instance of our SC
         const simpleStorage = await SimpleStorage.deployed();

         //Arrange : fake data string to feed to set()
         var _data = 'Vatsal';

         //Act: calling set() by giving fake data and get() to check if data is stored
         await simpleStorage.set(_data);
         const result = await simpleStorage.get();
         console.log(result);
         
         //Assert: comparing actualresult with expected one
         assert.equal(result,_data);

      });
});