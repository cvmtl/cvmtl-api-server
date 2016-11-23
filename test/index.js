// TODO look at https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai
// TODO clear any exist sqlite database
// TODO launch application, with new sqlite database
// TODO run tests

process.env.NODE_ENV = 'test';

const Promise = require('bluebird');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const fs = require('fs');
const net = require('net');

const server = require('../lib/main');
// console.log('xxxxxxxxxxx');
// console.log(server.start())
// console.log('yyyyyyyyyyy');
const serverUrl = 'http://localhost:7070';
//const databasePath = './test-database';

function startServer() {
    it('Server should start', function(done) {
        server.start().then(function() {
            done();
        })
    });
}

function preflight() {
    describe('Preflight tests', function() {
        it('Should connect', function(done) {
            // Set up a client and connect to port 7070
            net.connect({ port: 7070 },
                function() {
                    done();
                });
        });
    });
}

function runTests() {
    chai.use(chaiHttp);

    require('./auth').test(serverUrl);
    require('./projects').test(serverUrl, chai);

}

startServer();
preflight()
runTests();