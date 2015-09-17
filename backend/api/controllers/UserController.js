/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var qs = require('querystring');
var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');

module.exports = {
  facebookLogin: function (req, res) {
    var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.FACEBOOK_SECRET,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({
      url: accessTokenUrl,
      qs: params,
      json: true
    }, function (err, response, accessToken) {
      if (response.statusCode !== 200) {
        return res.status(500).send({
          message: accessToken.error.message + ' error here !!!'
        });
      }

      // Step 2. Retrieve profile information about the current user.
      request.get({
        url: graphApiUrl,
        qs: accessToken,
        json: true
      }, function (err, response, profile) {
        if (response.statusCode !== 200) {
          return res.status(500).send({
            message: profile.error.message + ' error or here!!!'
          });
        }
        if (req.headers.authorization) {
          User.findOne({
            facebook: profile.id
          }, function (err, existingUser) {
            if (existingUser) {
              return res.status(409).send({
                message: 'There is already a Facebook account that belongs to you'
              });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function (err, user) {
              if (!user) {
                return res.status(400).send({
                  message: 'User not found'
                });
              }
              user.facebook = profile.id;
              user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
              user.displayName = user.displayName || profile.name;
              user.save(function () {
                var token = createToken(user);
                res.send({
                  token: token,
                  user: user
                });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({
            facebook: profile.id
          }, function (err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              return res.send({
                token: token,
                user: existingUser
              });
            }
            User.create({
              facebook: profile.id,
              displayName: profile.name,
              facebookToken: profile.oauth_token,
              facebookSecret: profile.oauth_token_secret
                //              picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large'
            }).exec(function (err, user) {
              var token = createToken(user);
              res.send({
                token: token,
                user: user
              });
            });
          });
        }
      });
    });
  },

  login: function (req, res) {
    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    var authenticateUrl = 'https://api.twitter.com/oauth/authorize';

    if (!req.query.oauth_token || !req.query.oauth_verifier) {
      var requestTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        callback: config.TWITTER_CALLBACK
      };

      // Step 1. Obtain request token for the authorization popup.
      request.post({
        url: requestTokenUrl,
        oauth: requestTokenOauth
      }, function (err, response, body) {
        var oauthToken = qs.parse(body);
        var params = qs.stringify({
          oauth_token: oauthToken.oauth_token
        });

        // Step 2. Redirect to the authorization screen.
        res.redirect(authenticateUrl + '?' + params);
      });
    } else {
      var accessTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: req.query.oauth_token,
        verifier: req.query.oauth_verifier
      };

      // Step 3. Exchange oauth token and oauth verifier for access token.
      request.post({
        url: accessTokenUrl,
        oauth: accessTokenOauth
      }, function (err, response, profile) {
        profile = qs.parse(profile);
        // Step 4a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({
            twitter: profile.user_id
          }, function (err, existingUser) {
            if (existingUser) {
              return res.status(409).send({
                message: 'There is already a Twitter account that belongs to you'
              });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function (err, user) {
              if (!user) {
                return res.status(400).send({
                  message: 'User not found'
                });
              }
              user.twitter = profile.user_id;
              user.displayName = user.displayName || profile.screen_name;
              user.twitterToken = profile.oauth_token;
              user.twitterSecret = profile.oauth_token_secret;
              user.save(function (err) {
                res.send({
                  token: createToken(user),
                  user: user
                });
              });
            });
          });
        } else {
          // Step 4b. Create a new user account or return an existing one.
          User.findOne({
            twitter: profile.user_id
          }, function (err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              return res.send({
                token: token,
                user: existingUser
              });
            }
            User.create({
              twitter: profile.user_id,
              displayName: profile.screen_name,
              twitterToken: profile.oauth_token,
              twitterSecret: profile.oauth_token_secret
            }).exec(function (err, user) {
              var token = createToken(user);
              res.send({
                token: token,
                user: user
              });
            });
          });
        }
      });
    }
  }
};

function createToken(user) {
  var payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}
