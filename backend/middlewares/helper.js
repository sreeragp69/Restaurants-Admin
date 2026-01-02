const bcrypt = require("bcrypt");
const crypto = require("crypto");
const admin = require("firebase-admin");
var path = require("path");
const uuid = require("uuid").v4;
const axios = require("axios");

module.exports = {
  comparePass: async (requestPass, dbPass) => {
    dbPass = dbPass.replace("$2y$", "$2b$");
    const match = await bcrypt.compare(requestPass, dbPass);
    return match;
  },

  bcryptHash: (myPlaintextPassword, saltRounds = 10) => {
    const bcrypt = require("bcrypt");
    const salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(myPlaintextPassword, salt);
    hash = hash.replace("$2b$", "$2y$");
    return hash;
  },

  unixTimestamp: function () {
    var time = Date.now();
    var n = time / 1000;
    return (time = Math.floor(n));
  },

  sendSmsDigimiles: async function (to_phone, otp) {
    console.log(to_phone, otp)
    var config = {
      method: "get",
      url: `http://route.digimiles.in/bulksms/bulksms?username=DG35-yokmo&password=digimile&type=0&dlr=1&destination=${to_phone}&source=YOKINT&message=OTP for Popil Tunes is ${otp} and valid for 10 minutes. Do not share this OTP with anyone (Powered by Yokmo Interactive)&entityid=1501340910000044693&tempid=1507165796367404913`,
      headers: {},
    };
    try {
      const response = await axios(config);
      // console.log(response)
      console.log('OTP sent successfully:');
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};
