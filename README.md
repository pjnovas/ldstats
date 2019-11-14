# ldstats - Ludum Dare Ratings
Ratings API for Ludum Dare. Check it [out here](http://ldstats.info)

## Compile and run the project

### It's required to have installed
* [Node 6.10+](http://nodejs.org/)
* [Mongo 2.4+](https://www.mongodb.org/)
* [NPM 3+](http://npmjs.org/)

To get started:  
1. Clone this project  
2. `cd ldstats/`

To configure the server you must add a `config/config.json`, a config.sample file can be used as a base for that file.

After created that config file:

```bash
npm install
```

Now run the server:
```bash
npm start
```

## Getting totals of event for new LD WebAPI:
`https://api.ludumdare.com/vx/stats/[EVENT_ID]?pretty`  
```js
{
  // ...
    "stats": {
      // ...
      "jam": 1841,
      "compo": 1104,
      // ...
    }
}
```

## Contributors (thanks!)
* Ajay Ramachandran - [@ajayyy](https://github.com/ajayyy)
* Aurel - [@Aurel300](https://github.com/Aurel300)

