
/**
 * Site router controllers
 */

/**
 * Module dependencies
 */

import {render, redirect} from 'lib/routes/helpers';

export const appStack = []
  .concat([
    render('index', {
      title: 'Ludum Dare Ratings',
      description: 'Ratings API for Ludum Dare'
    })
  ]);
