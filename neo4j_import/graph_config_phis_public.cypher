// Create uniqueness constraint 
CREATE CONSTRAINT n10s_unique_uri IF NOT EXISTS ON (r:Resource)
ASSERT r.uri IS UNIQUE

// With default value
CALL n10s.graphconfig.init()
YIELD param, value
with count(*) AS dump

// Create mappings/prefixes

// General / W3C
CALL n10s.nsprefixes.add("skos","http://www.w3.org/2004/02/skos/core#")
YIELD prefix, namespace
with count(*) AS dump
CALL n10s.nsprefixes.add("rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#")
YIELD prefix, namespace
with count(*) AS dump
CALL n10s.nsprefixes.add("owl","http://www.w3.org/2002/07/owl#")
YIELD prefix, namespace
with count(*) AS dump
CALL n10s.nsprefixes.add("oa","http://www.w3.org/ns/oa#")
YIELD prefix, namespace
with count(*) AS dump

// Opensilex
CALL n10s.nsprefixes.add("oeev","http://www.opensilex.org/vocabulary/oeev#")
YIELD prefix, namespace
with count(*) AS dump
CALL n10s.nsprefixes.add("oeso","http://www.opensilex.org/vocabulary/oeso#")
YIELD prefix, namespace
with count(*) AS dump
CALL n10s.nsprefixes.add("security","http://www.opensilex.org/security#")
YIELD prefix, namespace
with count(*) AS dump
CALL n10s.nsprefixes.add("obo","http://purl.obolibrary.org/obo/")
YIELD prefix, namespace
with count(*) AS dump
// Instance specific
CALL n10s.nsprefixes.add("sinfonia", "http://sinfonia.vignevin.com/")
YIELD prefix, namespace
with count(*) AS dump

RETURN dump


// Couldn't succed to load a file to work (locally, seems fine using ftp endpoint)
// call n10s.rdf.import.fetch("file:///import/sinfonia_statements.ttl",
//    "Turtle")

// It appears to have to much data to load in one calllet's subdivise into graph
call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://138.102.159.36:7200/repositories/phis-publictest> {
        GRAPH ?g {?s ?p ?o}
        VALUES ?g {
<http://www.opensilex.org/vocabulary/oeso>
<http://xmlns.com/foaf/0.1/>               
<http://www.w3.org/ns/oa>     
<http://www.w3.org/2002/07/owl>     
<http://www.opensilex.org/security>     
<http://www.opensilex.org/vocabulary/oeev>         
<http://purl.org/dc/terms/>         
<http://www.w3.org/2006/vcard/ns>             
<http://www.w3.org/2006/time>         
<http://www.w3.org/ns/org>     
<http://purl.obolibrary.org/obo/peco.owl>                 
<http://www.opensilex.org/vocabulary/iado> 
        }
    }
}"
)})   


// Page 2
call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://138.102.159.36:7200/repositories/phis-publictest> {
        GRAPH ?g {?s ?p ?o}
        VALUES ?g {
            <http://www.w3.org/2006/time>
            <http://www.opensilex.org/vocabulary/oeso-ext>
            <http://opensilex.test/set/user>
            <http://opensilex.test/set/germplasm>
            <http://opensilex.test/set/project>
            <http://opensilex.test/id/experiment/eppn2020_jra1_4_obj3>
            <http://opensilex.test/set/experiment>
            <http://opensilex.test/set/organization>
            <http://opensilex.test/set/scientific-object>
            <http://opensilex.test/set/variable>
        }
    }
}"
)})   

// Page 3 - Part 1

call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://138.102.159.36:7200/repositories/phis-publictest> {
        GRAPH ?g {?s ?p ?o}
        VALUES ?g {
            <http://opensilex.test/set/device>
            <http://opensilex.test/set/event>
            <http://opensilex.test/set/variablesGroup>
            <http://opensilex.test/set/profile>
            <http://opensilex.test/set/group>
        }
    }
}"
)}) 

// Page 3 - Part 2

call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://138.102.159.36:7200/repositories/phis-publictest> {
        GRAPH ?g {?s ?p ?o}
        VALUES ?g {
            <http://www.phenome-fppn.fr/m3p/ARCH2017-03-30>
            <http://www.phenome-fppn.fr/diaphen/DIA2017-05-19>
            <http://opensilex.test/set/factor>
            <http://opensilex.test/set/opensilex-owl-extension>
            <http://purl.obolibrary.org/obo/peco.owl>
        }
    }
}"
)}) 

// Page 4

call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://138.102.159.36:7200/repositories/phis-publictest> {
        GRAPH ?g {?s ?p ?o}
        VALUES ?g {
            <http://purl.org/dc/terms/>
            <http://www.opensilex.org/vocabulary/iado>
            <http://opensilex.test/set/document>
            <http://opensilex.test/id/experiment/lsp_planting_1055551>
            <http://opensilex.test/set/area>
            <http://opensilex.test/id/experiment/ferme_uclouvain_moutarde_varietal>
        }
    }
}"
)})



















// We need to "bounce" over a virtuoso sparql endpoint... yes yes
call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://138.102.159.36:7200/repositories/phis-publictest> {
        ?s ?p ?o
    }
} limit 1000 "
)})   

call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://138.102.159.36:7200/repositories/phis-publictest> {
        ?s ?p ?o
    }
}"
)})   


call n10s.rdf.import.fetch("http://138.102.159.59:4203/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 

        ?s ?p ?o
    
} limit 100 "
)})   