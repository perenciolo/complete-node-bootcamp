const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const answer = require('./answer.json');
const FormData = require('form-data');

const splited = answer.cifrado.split(' ');
const numCasas = +answer.numero_casas;

var alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase().split('');

const decipher = splited
  .map(el =>
    el
      .toLowerCase()
      .split('')
      .map(el => {
        const i = alfabeto.indexOf(el);
        const max = alfabeto.length;

        if (i < 0) return el;

        const idx = (i - numCasas) % max;

        if (idx < 0) return alfabeto[max + idx];

        return alfabeto[idx];
      })
  )
  .map(arr => arr.join(''))
  .join(' ');

const sha1 = crypto
  .createHash('sha1')
  .update(decipher)
  .digest('hex');
answer.resumo_criptografico = sha1;
answer.decifrado = decipher;

var postData = JSON.stringify(answer);
fs.writeFileSync(path.resolve(__dirname, 'answer2.txt'), postData, 'utf-8');

const form_data = new FormData();
form_data.append(
  'answer',
  fs.createReadStream(path.resolve(__dirname, 'answer2.txt'), {
    filename: 'answer2.txt'
  })
);

const api =
  'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=cacaa558324f23b67737ce3651308649c2d03249';

const request_config = {
  headers: form_data.getHeaders(),
};

axios
  .create(request_config)
  .post(api, form_data)
  .then(res => console.log(res))
  .catch(e => console.error(e));
