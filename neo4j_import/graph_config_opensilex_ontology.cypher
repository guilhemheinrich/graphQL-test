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

RETURN dump




// We need to "bounce" over a virtuoso sparql endpoint... yes yes
call n10s.rdf.import.fetch("http://192.168.1.26:8890/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://192.168.0.168:7200/repositories/sinfonia-playground-2> {
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

call n10s.rdf.import.fetch("http://192.168.56.1:8890/sparql",
   "Turtle", { 
       languageFilter: "en",
        headerParams: { Accept: "application/turtle"},
        payload: 
        "query=" + apoc.text.urlencode("CONSTRUCT {?s ?p ?o } where { 
    SERVICE <http://192.168.0.168:7200/repositories/sinfonia-dev> {
        ?s ?p ?o
    }
}"
)})   
