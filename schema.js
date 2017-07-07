const {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require('graphql');

const AppType = new GraphQLObjectType({
  name: 'App',
  description: 'Top-level objects that link together and contain configuration information for your packages, droplets, processes, tasks, and more.',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: 'Name of the app',
      resolve: (obj) =>  {
        return obj.name
      }
    },
    guid: {
      type: GraphQLString,
      description: 'Guid of the app',
      resolve: (obj) =>  {
        return obj.guid
      }
    },
    packages: {
      type: new GraphQLList(PackageType),
      description: 'Packages for the app.',
      resolve: (obj, args, {loaders}) => {
        return loaders.package.loadManyByURL(obj.links.packages.href)
      },
    },
    processes: {
      type: new GraphQLList(ProcessType),
      description: 'Processes for the app.',
      resolve: (obj, args, {loaders}) => {
        return loaders.process.loadManyByURL(obj.links.processes.href)
      },
    },
    droplets: {
      type: new GraphQLList(DropletType),
      description: 'Droplets for the app.',
      resolve: (obj, args, {loaders}) => {
        return loaders.process.loadManyByURL(obj.links.droplets.href)
      },
    }
  })
});

const PackageType = new GraphQLObjectType({
  name: 'Package',
  description: 'An application’s ‘source code’; either raw bits for your application or a pointer to these bits.',
  fields: () => ({
    guid: {
      type: GraphQLString,
      description: 'Guid of the package',
      resolve: (obj) =>  {
        return obj.guid
      }
    },
    state: {
      type: GraphQLString,
      description: 'State of the package',
      resolve: (obj) =>  {
        return obj.state
      }
    },
  })
});

const ProcessType = new GraphQLObjectType({
  name: 'Process',
  description: 'The runnable units of an app.',
  fields: () => ({
    guid: {
      type: GraphQLString,
      description: 'Guid of the process',
      resolve: (obj) =>  {
        return obj.guid
      }
    },
    type: {
      type: GraphQLString,
      description: 'A unique identifier for processes belonging to an app.',
      resolve: (obj) =>  {
        return obj.type
      }
    },
    instances: {
      type: GraphQLString,
      description: 'The number of instances to run.',
      resolve: (obj) =>  {
        return obj.instances
      }
    },
  })
});

const DropletType = new GraphQLObjectType({
  name: 'Droplet',
  description: 'The result of staging an application package.',
  fields: () => ({
    guid: {
      type: GraphQLString,
      description: 'Guid of the droplet',
      resolve: (obj) =>  {
        return obj.guid
      }
    },
    state: {
      type: GraphQLString,
      description: 'State of the droplet.',
      resolve: (obj) =>  {
        return obj.state
      }
    },
  })
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    apps: {
      type: new GraphQLList(AppType),
      description: 'List of apps',
      args: {
        limit: {
          description: 'Max number to display',
          type: GraphQLInt
        }
      },
      resolve: (root, {limit}, {loaders}) => {
        const url = limit ? `/v3/apps/?per_page=${limit}` : `/v3/apps/`;
        return loaders.app.loadAll(url)
      },
    }
  }),
});

module.exports = new GraphQLSchema({
  query: QueryType,
});
