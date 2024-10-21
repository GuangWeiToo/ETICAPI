const apiKey=process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(',') : [];

function verifyApplication(privateKey) {
    if(!apiKey.includes(privateKey)){
      return apiKey;
    }
    return false;
  }

module.exports = { verifyApplication };