import rdfParser from "rdf-parse"
import { Quad } from "rdf-js"
import fs from 'fs-extra'

import gqlRDF from "./parser/processRdf";
import { ReadStream, WriteStream } from "fs";
import multiple_file_stream from './multiple_file_reader'   

const INPUT_ONTOLOGY = '/home/heinrich/code/graphQL-test/src/service/oeso-core.owl'
const OUTPUT_PARSED_ONTOLOGY = '/home/heinrich/code/graphQL-test/src/service/parsed_ontology.txt'
const OUTPUT_MODEL = '/home/heinrich/code/graphQL-test/src/service/output.json'
const OUTPUT_GQL = '/home/heinrich/code/graphQL-test/src/service/output.gql'
const writeStream = fs.createWriteStream(OUTPUT_PARSED_ONTOLOGY);
// const readStream = fs.createReadStream(INPUT_ONTOLOGY);

let data: Quad[] = []
writeStream.on("finish", () => {
    // console.log(data)
    // Order data
    // Class declaration first
    fs.writeFileSync(OUTPUT_MODEL, JSON.stringify(gqlRDF.gql_resources_preprocesing, undefined, 2))
    fs.writeFileSync(OUTPUT_GQL, gqlRDF.templater())
    // console.log(gqlRDF.gql_properties_preprocessing)
})


function consumer(readStream: ReadStream, writeStream: WriteStream) {
    return rdfParser.parse(readStream, { contentType: 'application/rdf+xml', baseIRI: 'http://example.org' })
    .on('data', (quad: Quad) => {
        // data.push(quad)
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
        
    });
}


const ONTOLOGY_OWL = '/home/heinrich/code/graphQL-test/src/service/ontologies/owl.owl'
const ONTOLOGY_OA = '/home/heinrich/code/graphQL-test/src/service/ontologies/oa.rdf'
const ONTOLOGY_OEEV = '/home/heinrich/code/graphQL-test/src/service/ontologies/oeev.owl'
const ONTOLOGY_OESO_CORE = '/home/heinrich/code/graphQL-test/src/service/ontologies/oeso-core.owl'


multiple_file_stream(consumer, writeStream, ONTOLOGY_OA, ONTOLOGY_OEEV, ONTOLOGY_OESO_CORE)
