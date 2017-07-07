const DataLoader = require('dataloader');

const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');
const yaml = require('js-yaml');

const config = yaml.safeLoad(fs.readFileSync('./grapi.yml', 'utf8'));

const BASE_URL = config.api_url;
let authHeader;

function getJSONFromURL(url) {
  url = url.replace('https', 'http');
  const headers = {headers: {"Authorization": authHeader}};
  return fetch(url, headers)
    .then(res => res.json());
}

function getJSONFromRelativeURL(relativeURL) {
  return getJSONFromURL(`${BASE_URL}${relativeURL}`);
}

function getApps(limit) {
  return getJSONFromRelativeURL(`/v3/apps/?per_page=${limit}`)
    .then(json => json.resources);
}

function getPackagesByURL(url) {
  return getJSONFromURL(url)
    .then(json => json.resources);
}

const app = express();

app.use(graphqlHTTP(req => {
  const cacheMap = new Map();

  auth = req.header('Authorization')

  const appLoader =
    new DataLoader(keys => Promise.all(keys.map(getApps)), {cacheMap});
  const packageLoader = {}
  const packagesByURLLoader =
    new DataLoader(keys => Promise.all(keys.map(getPackagesByURL)), {cacheMap});

  appLoader.loadAll = appLoader.load.bind(appLoader)
  packageLoader.loadManyByURL = packagesByURLLoader.load.bind(packagesByURLLoader)
  const loaders = {
    app: appLoader,
    package: packageLoader
  };

  return {
    context: {loaders},
    schema,
  };
}));

app.listen(
  5000,
  () => console.log('GraphQL Server running at http://localhost:5000')
);
