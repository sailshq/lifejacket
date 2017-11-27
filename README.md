[![Redirecting http requests to https in Node.js with Sails.js](https://camo.githubusercontent.com/9e49073459ed4e0e2687b80eaf515d87b0da4a6b/687474703a2f2f62616c64657264617368792e6769746875622e696f2f7361696c732f696d616765732f6c6f676f2e706e67)](https://sailsjs.com)

# lifejacket

Redirect http:// to https:// in your Node.js/Sails.js application to ensure TLS/SSL, plus a bit of middleware for handling LetsEncrypt cert renewals.

> When using SSL, also be sure to always [enable secure cookies](https://sailsjs.com/documentation/reference/configuration/sails-config-http)!  Otherwise, the initial http:// request (before redirecting) could still transmit sensitive data in plain text.


-----------------------------------

## Disclaimer

**If you can get away with it, I'd always recommend simply buying a wildcard SSL cert and then using a tool like Cloudflare to handle SSL redirects automatically.**  The convenience and lack of _yet another thing to maintain_ makes the addition of another layer of infrastructure _well worth it_, IMO.  (Here's the [cheat sheet](https://gist.github.com/mikermcneil/d3114517e4c7263b145274ea4ad3d0cb) I use when setting up Cloudflare with Heroku.)

That said, this hook exists for those situations where buying a wildcard cert (~$100-150 per year) or setting up a free Cloudflare account is not an option, for whatever reason.

-----------------------------------



## Installation

To install this hook in your Sails app, just run:

```bash
$ npm install lifejacket --save
```

Then set the following configuration (probably in your `config/env/production.js` file):

```js
lifejacket: {

  // Disabled by default. (e.g. for local dev)
  // So you'll want to override this in your config/env/production.js file,
  // setting it to `true`.
  ensureHttps: true,

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // If you don't already have the conventional `sails.config.custom.baseUrl` set,
  // then uncomment the following `host` config.  This must be set manually if `ensureHttps`
  // is enabled.
  // > Should be provided as a string, like `foo.example.com`.
  // host: 'mysweetsite.com',
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

},
```

Then, when you lift in production, `http://` requests should redirect to `https://`.


## Questions?

See [Extending Sails > Hooks](https://sailsjs.com/documentation/concepts/extending-sails/hooks) in the [Sails documentation](https://sailsjs.com/documentation), or check out [recommended support options](https://sailsjs.com/support).


## Contributing &nbsp; [![Build Status](https://travis-ci.org/sailshq/lifejacket.svg?branch=master)](https://travis-ci.org/sailshq/lifejacket)

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](https://sailsjs.com/documentation/contributing) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/lifejacket.png?downloads=true)](http://npmjs.com/package/lifejacket)


## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/lifejacket.svg)](http://npmjs.com/package/lifejacket)

To report a bug, [click here](https://sailsjs.com/bugs).



## License

This [community hook](https://sailsjs.com/documentation/concepts/extending-sails/hooks) is available under the **MIT license**.

As for the [Sails framework](https://sailsjs.com)?  It's free and open-source under the [MIT License](https://sailsjs.com/license).

&copy; [Mike McNeil](https://sailsjs.com/about)

![image_squidhome@2x.png](http://i.imgur.com/RIvu9.png)
