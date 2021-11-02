var express = require('express');
var graphqlHTTP = require('express-graphql');
const staple = require("staple-api");

const ontology = {
    file: "/home/heinrich/code/graphQL-test/src/service/ontology.ttl"
}
const config = {
        dataSources: {
            default: "source",
            source: {
                type: "sparql",
                url: "d", 
                updateUrl: "http://138.102.159.59:4203/sparql/update",
                graphName: "http://example.com/test",
                description: "SPARQL endpoint (graph: http://example.com/test)"
            }
        }
    }
async function StapleDemo() {
    let stapleApi = await staple(ontology, config);

    var app = express();
    app.use('/graphql', graphqlHTTP({
        schema: stapleApi.schema,
        graphiql: true
    }));

    app.listen(4000);
    console.log('Running a GraphQL API server at localhost:4000/graphql');
}

StapleDemo()