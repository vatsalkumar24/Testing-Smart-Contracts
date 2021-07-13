## Installation

1. Install git, to clone the repo

```bash
sudo apt install git-all
```

4. Clone the repo and install its dependencies.

```bash
npm install
npm install -g ganache-cli
clone sushiswap repo: https://github.com/sushiswap/sushiswap
```

## Running the demo

1. Use alchemy API which looks like on one terminal using the fork command given in step3.

   https://eth-mainnet.alchemyapi.io/v2/_hWb1xArzWlHmVrxGxxE12CvqWUzTEO8

2. Copy the env

````
copy the sample env

3. Run on parallel terminal

```bash
ganache-cli --fork https://eth-mainnet.alchemyapi.io/v2/_hWb1xArzWlHmVrxGxxE12CvqWUzTEO8 -b 2 -d

````

4. On the terminal thats you use to create .env or in a new one run the demo script with -a or -b option for use one of the two swaps directions possibles.

```bash
node ./src/demo_environment.js -a
#or
node ./src/demo_environment.js -b
```

This script will create two tokens and their correspond liquidity pools

5. Finally, execute the bot you want to use.

```bash
node ./src/bot_normalswap.js
```

6.  Need to set up a provider, the code its setted up to use Infura but you can easily change it.
