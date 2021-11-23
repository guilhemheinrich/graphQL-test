import rdfParser from "rdf-parse"
import { Quad } from "rdf-js"
import fs from 'fs-extra'

import gqlRDF from "./parser/processRdf";
import processOwl from "./parser/processOwl";

const INPUT_ONTOLOGY = '/home/heinrich/code/graphQL-test/src/service/oeso-core.owl'
const OUTPUT_PARSED_ONTOLOGY = '/home/heinrich/code/graphQL-test/src/service/parsed_ontology.txt'
const OUTPUT_MODEL = '/home/heinrich/code/graphQL-test/src/service/output.json'
const OUTPUT_GQL = '/home/heinrich/code/graphQL-test/src/service/output.gql'
const writeStream = fs.createWriteStream(OUTPUT_PARSED_ONTOLOGY);
const readStream = fs.createReadStream(INPUT_ONTOLOGY);

let data: Quad[] = []
writeStream.on("finish", () => {
    // console.log(data)
    // Order data
    // Class declaration first
    fs.writeFileSync(OUTPUT_MODEL, JSON.stringify(gqlRDF.gql_resources_preprocesing, undefined, 2))
    fs.writeFileSync(OUTPUT_GQL, gqlRDF.templater())
    // console.log(gqlRDF.gql_properties_preprocessing)
})
rdfParser.parse(readStream, { contentType: 'application/rdf+xml', baseIRI: 'http://example.org' })
    .on('data', (quad: Quad) => {
        data.push(quad)
        gqlRDF.processRdf(quad)
        // // if (quad.subject.termType == 'NamedNode')
        // processRdf(quad)
        // processOwl(quad)
        // console.log(quad)
        // console.log(`${quad.subject.value} ${quad.predicate.value} ${quad.object.value}`)
        writeStream.write(JSON.stringify(quad, undefined, 2))
        writeStream.write('\n')
        // writeStream.write(`${quad.subject.value} ${quad.predicate.value} ${quad.object.value}`)
        writeStream.write('\n\n')
    })
    .on('error', (error) => console.error(error))
    .on('end', () => {
        console.log('All done!')
        writeStream.close()
    });

// RdfParser.parse(textStream, { path: './ontology.ttl', baseIRI: 'http://example.org' })
//     .on('data', (quad) => console.log(quad))
//     .on('error', (error) => console.error(error))
//     .on('end', () => console.log('All done!'));
