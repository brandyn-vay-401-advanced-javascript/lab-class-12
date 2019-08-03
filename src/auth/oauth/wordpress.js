'use strict';

const superagent = require('superagent');
const Users = require('../users-model');

let authorize = (request) => {
  
  console.log('(1)', request.query.code);
  
  return superagent.post(process.env.WORDPRESS_TOKEN)
    .type('form')
    .send({
      code: request.query.code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: `${process.env.PORT}/oauth`,
      grant_type: 'authorization_code',
    })
    .then( response => {
      let access_token = response.body.access_token;
      console.log('(2)', access_token);
      return access_token;
    })
    .then(token => {
      console.log(process.env.WORDPRESS_AUTHORIZE, token);
      return superagent.get(process.env.WORDPRESS_AUTHORIZE)
        .set('Authorization', `Bearer ${token}`)
        .then( response => {
          let user = response.body;
          console.log('(3)', user);
          return user;
        });
    })
    .then( oauthUser => {
      console.log('(4) Create Our Account');
      return Users.createFromOauth(oauthUser.email);
    })
    .then( actualUser => {
      return actualUser.generateToken(); 
    })
    .catch( error => error );
};


module.exports = authorize;