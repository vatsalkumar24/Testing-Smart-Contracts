const DydxFlashLoan = artifacts.require("FlashLoanTemplate")

contract("DydxFlashLoan", (accounts)=>{
   it("Should deploy DydxFlashLoan",async()=>{
      dydxFlashLoan = await DydxFlashLoan.new();
      console.log(dydxFlashLoan.address);
   })
})