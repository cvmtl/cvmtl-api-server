const chai = require('chai');
const chaiHttp = require('chai-http');
//const should = chai.should();

var url;

function test(serverUrl) {
    var token;

    url = serverUrl;

    describe('Project Service', function() {
        // it('Should get an auth token', (done) => {

        //     var data = {
        //         "username": "test@gmail.com",
        //         "password": "xyz"
        //     };

        //     chai.request(url)
        //         .post('/api/auth/local/login')
        //         .send(data)
        //         .end(function(err, res) {
        //             if (err) { done(err); }
        //             res.should.have.status(200);
        //             res.should.be.json;
        //             res.body.should.have.property('token');
        //             token = res.body.token;
        //             done();
        //         });
        // });

        it('Should create a project with a geojson area', (done) => {
            var data = {
                title: 'Project X',
                description: 'Lorem ipsum dolor sit amet.',
                shortname: 'MTL-PRJ-0123',
                area: {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [-67.13734351262877, 45.137451890638886],
                                [-66.96466, 44.8097],
                                [-68.03252, 44.3252],
                                [-69.06, 43.98],
                                [-70.11617, 43.68405],
                                [-70.64573401557249, 43.090083319667144],
                                [-70.75102474636725, 43.08003225358635],
                                [-70.79761105007827, 43.21973948828747],
                                [-70.98176001655037, 43.36789581966826],
                                [-70.94416541205806, 43.46633942318431],
                                [-71.08482, 45.3052400000002],
                                [-70.6600225491012, 45.46022288673396],
                                [-70.30495378282376, 45.914794623389355],
                                [-70.00014034695016, 46.69317088478567],
                                [-69.23708614772835, 47.44777598732787],
                                [-68.90478084987546, 47.184794623394396],
                                [-68.23430497910454, 47.35462921812177],
                                [-67.79035274928509, 47.066248887716995],
                                [-67.79141211614706, 45.702585354182816],
                                [-67.13734351262877, 45.137451890638886]
                            ]
                        ]
                    }
                }
            };

            chai.request(url)
                .post(`/api/projects`)
                .send(data)
                .end(function(err, res) {
                    if (err) {
                        done(err);
                    }
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.status.should.be.equal('ok');
                    done();
                });
        });
    });
}

chai.use(chaiHttp);

module.exports.test = test;