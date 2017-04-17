[![Redirecting http requests to https in Node.js with Sails.js](https://camo.githubusercontent.com/9e49073459ed4e0e2687b80eaf515d87b0da4a6b/687474703a2f2f62616c64657264617368792e6769746875622e696f2f7361696c732f696d616765732f6c6f676f2e706e67)](https://sailsjs.com)

# sails-hook-lifejacket

Redirect http:// to https:// in your Node.js/Sails.js application to ensure TLS/SSL.

> Be sure to [enable secure cookies](https://sailsjs.com/documentation/reference/configuration/sails-config-http)!  Otherwise, the initial http:// request (before redirecting) could still transmit sensitive data in plain text.


## Installation

To install this hook in your Sails app, just run:

```bash
$ npm install sails-hook-lifejacket --save
```

Then set the following configuration (probably in your config/env/production.js file):

```js
lifejacket: {

  // Disabled by default. (e.g. for local dev)
  // So you'll want to override this in your config/env/production.js file,
  // setting it to `true`.
  ensureHttps: true,

  // Must be set manually if `ensureHttps` is enabled.
  // > Should be provided as a string, like `foo.example.com`.
  host: 'mysweetsite.com'

};
```

Then, when you lift in production, `http://` requests should redirect to `https://`.


## Questions?

See [Extending Sails > Hooks](https://sailsjs.com/documentation/concepts/extending-sails/hooks) in the [Sails documentation](https://sailsjs.com/documentation), or check out [recommended support options](https://sailsjs.com/support).


## Contributing &nbsp; [![Build Status](https://travis-ci.org/sailshq/sails-hook-lifejacket.svg?branch=master)](https://travis-ci.org/sailshq/sails-hook-lifejacket) &nbsp; [![Build status on Windows](https://ci.appveyor.com/api/projects/status/u0i1o62tsw6ymbjd/branch/master?svg=true)](https://ci.appveyor.com/project/mikermcneil/sails-hook-lifejacket/branch/master)

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](https://sailsjs.com/documentation/contributing) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/sails-hook-lifejacket.png?downloads=true)](http://npmjs.com/package/sails-hook-lifejacket)


## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/sails-hook-lifejacket.svg)](http://npmjs.com/package/sails-hook-lifejacket)

To report a bug, [click here](https://sailsjs.com/bugs).



## License

This [core adapter](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters) is available under the **MIT license**.

As for [Waterline](http://waterlinejs.org) and the [Sails framework](https://sailsjs.com)?  They're free and open-source under the [MIT License](https://sailsjs.com/license).

&copy; [The Sails Co.](https://sailsjs.com/about)

![image_squidhome@2x.png](http://i.imgur.com/RIvu9.png)
