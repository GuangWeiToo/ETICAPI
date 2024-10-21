const apiKey=process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(',') : [];

function verifyApplication(privateKey) {
  console.log(apiKey);
  console.log(privateKey)
    if(!apiKey.includes(privateKey)){
      return true;
    }
    return false;
  }

module.exports = { verifyApplication };