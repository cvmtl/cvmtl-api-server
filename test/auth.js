const chai = require('chai');
const chaiHttp = require('chai-http');
//const should = chai.should();

var url;

function test(serverUrl) {
    var token;

    url = serverUrl;

}

chai.use(chaiHttp);

module.exports.test = test;