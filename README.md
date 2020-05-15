# ldstats - Ludum Dare Ratings

Ratings API for Ludum Dare. Check it [out here](http://ldstats.info)

## Compile and run the project

### Quickly using docker:

```bash
docker-compose up
```

### Without docker:

Requirements:

- [Node 10+](http://nodejs.org/)
- [Mongo 3+](https://www.mongodb.org/)
- [NPM 6.9+](http://npmjs.org/)

```bash
npm install
```

Now run the server:

```bash
MONGO_URL=mongodb://[Your-mongo-conn-string]/ldstats npm start
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

And update latest LD and those totals in `./config.json`

## Contributors (thanks!)

- Ajay Ramachandran - [@ajayyy](https://github.com/ajayyy)
- Aurel - [@Aurel300](https://github.com/Aurel300)
