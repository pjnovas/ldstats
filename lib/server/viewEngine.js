
import exphbs from 'express-handlebars';

import {version} from 'package.json';
import {googleAnalytics} from 'config';

var hbs = exphbs.create({
  defaultLayout: 'layout',
  extname: '.hbs',
  layoutsDir: 'views/',
  helpers: {
    json: context => JSON.stringify(context),
    version,
    showGA: options => {
      if (googleAnalytics) return options.fn(this);
      return options.inverse(this);
    },
    googleAnalytics
  }
});

export default hbs.engine;
