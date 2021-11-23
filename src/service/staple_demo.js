const staple = require("staple-api");
const { printSchema } = require('graphql');
const fs = require('fs')
const ontology = {
    file: "/home/heinrich/code/graphQL-test/src/service/ontology.ttl"
}

let config = {
    dataSources: {
        default: "source",
        source: {
            type: "memory",
            description: "In-memory DB"
        }
    }
}

async function StapleDemo() {
    let stapleApi = await staple(ontology, config);

    console.log(stapleApi.schemaSDL)
    // try {
    //     const data = fs.writeFileSync('/home/heinrich/code/graphQL-test/src/service/inferred_gql.txt', JSON.stringify(printSchema(stapleApi.schema), null, 2))
    //     //file written successfully
    // } catch (err) {
    //     console.error(err)
    // }
    // await stapleApi.graphql('mutation { Person(input: { _id: "http://example.com/john" name: "John Smith" } ) }').then((response) => {
    //   });

    // await stapleApi.graphql('{ Person { _id name } }').then((response) => {
    //     console.log(JSON.stringify(response))
    //   });
}

StapleDemo()