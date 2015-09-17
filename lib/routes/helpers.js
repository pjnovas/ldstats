
/**
 * Router helpers are functions (in general middlewares) common to many routes
 */

/**
 * Module dependencies
 */

/*
 * Render templates
 */

export const render = (path, options) => (req, res) => res.render(path, options);

/*
 * Redirect
 */

export const redirect = route => (req, res) => res.redirect(route);

/*
 * Makes vars available to views
 */

export const setViewVar = (key, value) => ((req, res, next) => {
  res.locals[key] = value;
  next();
});
