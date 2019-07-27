require('dotenv').config();
const request = require('request');
json_controller = require('../controllers/json.controller');
js_controller = require('../controllers/js.controller');

exports.validad2 = (req, res) => {
    const cpf = (req.body.cpf != undefined) ? req.body.cpf : null;

    if (cpf) {
        const body = {
            id: process.env.MARATONA_ID,
            desafio: process.env.DESAFIO,
            cpf: cpf,
            bucket: process.env.BUCKET,
            serviceInstanteId: process.env.IAM_SERVICEID_CRN,
            apikey: process.env.APIKEY,
        };
        if (!body) {
            res.status(404).json({
                msg: 'Something is missing'
            });
        } else {
            request({
                uri: 'https://8d829621.us-south.apiconnect.appdomain.cloud/desafios/desafio8',
                body: body,
                json: true,
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                }
            }, function (err, response) {
                if (err || response.body.err) {
                    console.log(err);
                    res.status(500).json({
                        msg: 'Something is wrong, contact support.'
                    });
                } else {
                    res.status(201).json({
                        msg: response.body
                    });
                }
            });
        }
    }
    else res.status(404).json({
        msg: 'CPF is missing!'
    });
}
