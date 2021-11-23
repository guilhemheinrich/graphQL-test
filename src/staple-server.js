var express = require('express');
var graphqlHTTP = require('express-graphql');
const staple = require("staple-api");
const fs = require("fs-extra")

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

const output_file = 'staple_sdl.txt'
async function StapleDemo() {
    let stapleApi = await staple(ontology, config);
    fs.createFileSync(output_file)
    fs.writeFileSync(output_file, stapleApi.schemaSDL)
    stapleApi.schemaSDL
}

StapleDemo()