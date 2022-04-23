const { environment } = require('@rails/webpacker');

const webpack = require('webpack');
const dotenv = require('dotenv').config();

environment.plugins.prepend(
  'Environment',
  new webpack.DefinePlugin({
    'process.env': JSON.stringify({
      MAPBOX_KEY: process.env.MAPBOX_KEY,
      MAPTILER_KEY: process.env.MAPTILER_KEY,
      FLICKR_KEY: process.env.FLICKR_KEY,
      GOOGLE_KEY: process.env.GOOGLE_KEY,
      WEATHER_KEY: process.env.WEATHER_KEY,
    }),
  })
);

module.exports = environment;
