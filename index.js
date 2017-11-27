/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');


/**
 * lifejacket
 *
 * A Sails hook for taking care of stuff related to SSL.
 * (BUT SEE DISCLAIMER IN README!  THERE ARE BETTER WAYS TO DO THIS!)
 *
 * Handle LE/ACME challenges and do `http://`->`https://` redirects.
 *
 * • About LetsEncrypt (LE):
 *   —· https://letsencrypt.org/
 *
 * • About Automatic Certificate Management Environment (ACME):
 *   —· https://github.com/ietf-wg-acme/acme
 *
 * > Inspired by @simonratner's koa-acme (https://github.com/simonratner/koa-acme)
 * >
 * > MIT License
 * > Copyright 2016 Simon Ratner, 2017 Mike McNeil.
 */

module.exports = function lifejacket(sails) {

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // NOTE: It is not clear if we'll need to use this or not-- it'll depend
  // a lot on our production setup (and e.g. whether `req.secure` / `req.host`
  // are actually meaningful/correct on our production server.)
  // For now, it is disabled here by default.
  //
  // (See also https://github.com/themadcreator/acme-express for another way to do this)
  //
  // Also, note that with Heroku, as of March 27, 2017, this stuff is now
  // (more or less) taken care of automatically:
  // -· https://devcenter.heroku.com/articles/automated-certificate-management
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  return {

    defaults: {

      lifejacket: {

        // Auto-redirect HTTP to HTTPS?
        // Disabled by default. (e.g. for local dev)
        ensureHttps: false,

        // Must be set manually if `ensureHttps` is enabled-- or better yet,
        // use sails.config.custom.baseUrl instead.  (This looks there if not
        // specified.)
        // > Should be provided as a string, like `foo.example.com`.
        host: undefined,

        // ACME challenge credentials for LetsEncrypt
        acmeChallengeToken: undefined,
        acmeKeyAuthorization: undefined
      }

    },


    configure: function (){

      if (sails.config.lifejacket.ensureHttps !== undefined) {
        if (!_.isBoolean(sails.config.lifejacket.ensureHttps)) {
          throw flaverr({ name: 'Configuration Error' }, new Error('If provided, `sails.config.lifejacket.ensureHttps` must be set to either `true` or `false`.  But instead got: '+util.inspect(sails.config.lifejacket.ensureHttps, {depth:null})));
        }
      }//ﬁ

      if (sails.config.letsEncrypt.acmeChallengeToken !== undefined && !_.isString(sails.config.letsEncrypt.acmeChallengeToken)) {
        throw new Error('Configuration error in LetsEncrypt hook: If set, "letsEncrypt.acmeChallengeToken" must be set as a valid string.  Instead, got: '+util.inspect(sails.config.letsEncrypt.acmeChallengeToken));
      }
      if (sails.config.letsEncrypt.acmeKeyAuthorization !== undefined && !_.isString(sails.config.letsEncrypt.acmeKeyAuthorization)) {
        throw new Error('Configuration error in LetsEncrypt hook: If set, "letsEncrypt.acmeKeyAuthorization" must be set as a valid string.  Instead, got: '+util.inspect(sails.config.letsEncrypt.acmeKeyAuthorization));
      }

      // If `host` config was provided, or if falling back to sails.config.custom.baseUrl yields something...
      sails.config.lifejacket.host = sails.config.lifejacket.host || sails.config.custom.baseUrl || undefined;
      if (!_.isUndefined(sails.config.lifejacket.host)) {

        // Validate it.
        if (!_.isString(sails.config.lifejacket.host)) {
          throw flaverr({ name: 'Configuration Error' }, new Error('`sails.config.lifejacket.host` must be configured as a string (like `foo.example.com`).  But instead got: '+util.inspect(sails.config.lifejacket.host, {depth:null})));
        }

        // Coerce it to strip off path/querystring/fragment/port/protocol
        sails.config.lifejacket.host = _.trimRight(sails.config.lifejacket.host, '/');
        sails.config.lifejacket.host = sails.config.lifejacket.host.replace(/\:[0-9]+$/, '');
        sails.config.lifejacket.host = sails.config.lifejacket.host.replace(/^https?:\/\//, '');

      }
      // Otherwise, if it wasn't provided, make sure that's actually OK.
      // (if ensureHttps is enabled, then it is required)
      else {

        if (sails.config.lifejacket.ensureHttps) {
          throw flaverr({ name: 'Configuration Error' }, new Error('Since `sails.config.lifejacket.ensureHttps` is enabled, a valid `sails.config.lifejacket.host` must be configured as a string (like `staging.example.com`).  But instead got: '+util.inspect(sails.config.lifejacket.host, {depth:null})));
        }

      }//>-•

    },


    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
    initialize: function (done) {

      sails.log.debug(
        'Initializing `lifejacket` hook...  '+
        (sails.config.lifejacket.ensureHttps ? '(https auto-redirects are ENABLED!)' : '(but https auto-redirects are disabled)')
      );

      // If this is production, but `lifejacket.ensureHttps` is NOT enabled, then
      // log a little warning message to the console.
      if (!sails.config.lifejacket.ensureHttps && process.env.NODE_ENV === 'production') {
        sails.log.warn('Detected production environment, but "https://" auto-redirects are disabled!');
        sails.log.warn('(Set `sails.config.lifejacket.ensureHttps` to `true` to turn them on again.)');
        sails.log.warn();
      }//-•

      // Be sure and call `done()` when finished!
      // (Pass in Error as the first argument if something goes wrong to cause Sails
      //  to stop loading other hooks and give up.)
      return done();

    },


    routes: {
      before: {

        // Respond to acme http-01 challenge requests.
        '/.well-known/acme-challenge/*': {
          skipAssets: true,
          fn: function (req, res, next) {

            // If challenge token or authorization are missing, then fail silently.
            if (!sails.config.letsEncrypt.acmeChallengeToken || !sails.config.letsEncrypt.acmeKeyAuthorization) {
              return next();
            }//•

            // Only respond if the supposed challenge token is valid.
            var supposedChallengeToken = req.param('0');
            var actualChallengeToken = sails.config.letsEncrypt.acmeChallengeToken;
            if (supposedChallengeToken !== actualChallengeToken) {
              return next();
            }//•

            var keyAuthorization = sails.config.letsEncrypt.acmeKeyAuthorization;
            return res.send(keyAuthorization);

          }
        },

        // Redirect http:// to https:// if configured to do so.
        'all /*': function (req, res, next) {

          // console.log('x-forwarded-proto:', req.get('x-forwarded-proto'));
          // console.log('sails.config.lifejacket.ensureHttps:', req.get('sails.config.lifejacket.ensureHttps'));

          // If the `lifejacket.ensureHttps` setting is disabled, then anything goes.
          if (!sails.config.lifejacket.ensureHttps) {
            return next();
          }//•

          // If is a virtual request from a socket, then anything goes.
          // (Don't try to redirect)
          if (req.isSocket) {
            return next();
          }//•


          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // This must be an HTTP request of some kind, and we must be interested
          // in redirecting it, since we're configured to do so.
          //
          // Therefore, we'll check this request and see if it was originally sent
          // via the `http://` protocol.  If so, we'll redirect it to `https://`.
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          var isHttpsRequest = req.get('x-forwarded-proto') === 'https' || (req.host && req.protocol==='https');
          if (isHttpsRequest) {
            // If this is https://, then we're good.
            // (we'll go ahead and allow the request through)
            return next();
          } else if (req.url.match(/^\/\.well-known\/acme-challenge\/(.+)/)) {
            // Always allow unsecure (http://) requests to the ACME challenge
            // request endpoint.
            return next();
          } else {
            // But otherwise, redirect to the https:// equivalent.
            // Otherwise, this is an insecure request to `http://`.
            // So redirect it to its `https://` cousin.
            return res.redirect(301, 'https://'+sails.config.lifejacket.host+req.url);
          }

        }//</ all /* >

      }//</.before>
    }//</.routes>

  };

};
