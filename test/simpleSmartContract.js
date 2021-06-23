// import truffle contract artifact, an object to manipulate our SC
const SimpleSmartContract = artifacts.require('SimpleSmartContract');

//contract block is equivalent to describe block of mocha
//everytime we declare contact block a new instance of our SC is created, so if two tests are in different blocks they will act on diff instances
contract('SimpleSmartContract',() => {
      // Test 1: Testing the deployment of SC
      it('Should deploye SC properly',async() =>{

            //instance of deployed SC
            const simpleSmartContract = await SimpleSmartContract.deployed();

            //Arrange(not testing any function so no arrange values)

            //Act: getting address of deployed SC
            console.log(simpleSmartContract.address);

            //Assert: checking if address is not empty, i.e, it is deployed properly
            assert(simpleSmartContract.address !=='');
      });
      // Test 2: testing add()
      it('SC should add 2 numbers', async () =>{

         //first thing to do is grab contract instance, which points to deployed SC on blockchain
         //deployed() returns a JS Object pointing to our deployed SC/
         const simpleSmartContract = await SimpleSmartContract.deployed();
         
         //Arrange : create some fake data to feed to our test
         var a = 1; var b = 2;
         
         //Act : we will actually run function that we will test
         const actualresult = await simpleSmartContract.add(a,b);
         console.log(actualresult.toString());
         //Assert: compare value of actual result from function to expected value
         assert(actualresult.toString() === '3');

      })
});