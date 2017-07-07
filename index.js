const DataLoader = require('dataloader');

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');
const yaml = require('js-yaml');
const cors = require('cors');

const config = yaml.safeLoad(fs.readFileSync('./grapi.yml', 'utf8'));
const BASE_URL = config.api_url;
let authHeader;

function getJSONFromURL(url) {
  url = url.replace('https', 'http');
  const headers = {"Authorization": authHeader};
  return axios.get(url, {headers})
    .then(res => {
      console.log(res);
      return res.data
    }).catch(err => {
      console.error(err.response.data);
      throw new Error(JSON.stringify(err.response.data));
    });
}

function getJSONFromRelativeURL(relativeURL) {
  return getJSONFromURL(`${BASE_URL}${relativeURL}`);
}

function getApps(url) {
  return getJSONFromRelativeURL(url)
    .then(json => json.resources);
}

function getResourcesByURL(url) {
  return getJSONFromURL(url)
    .then(json => json.resources);
}

const app = express();

app.use(cors(), graphqlHTTP(req => {
  const cacheMap = new Map();

  authHeader = req.header('Authorization');

  const appLoader =
    new DataLoader(keys => Promise.all(keys.map(getApps)), {cacheMap});

  const resourceLoader = {};
  const resourcesByURLLoader =
    new DataLoader(keys => Promise.all(keys.map(getResourcesByURL)), {cacheMap});


  appLoader.loadAll = appLoader.load.bind(appLoader);
  resourceLoader.loadManyByURL = resourcesByURLLoader.load.bind(resourcesByURLLoader);

  const loaders = {
    app: appLoader,
    resource: resourceLoader,
  };

  return {
    context: {loaders},
    schema,
  };
}));

app.listen(
  process.env.PORT || 5000,
  () => console.log('GraphQL Server running at http://localhost:5000')
);
