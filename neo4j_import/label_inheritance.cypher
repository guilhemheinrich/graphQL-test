// Add n10s_label property to owl__Class, to match label naming convention
CALL n10s.nsprefixes.list()
YIELD prefix, namespace
WITH prefix, namespace
MATCH (class:owl__Class) WHERE EXISTS(class.rdfs__label) AND class.uri STARTS WITH namespace
WITH class, prefix, namespace
WITH REPLACE(apoc.text.capitalizeAll(class.rdfs__label) , ' ', '') AS captilizedLabel, class, prefix, namespace
SET class.n10s_label = prefix + '__' + captilizedLabel
RETURN class

// Complete the label by itering over all labels of the db
CALL db.labels()
YIELD label
WITH label
CALL n10s.inference.nodesLabelled(label,  {
  catNameProp: "n10s_label",
  catLabel: "owl__Class",
  subCatRel: "rdfs__subClassOf"
})
YIELD node
WITH node AS nodein, label
CALL apoc.create.addLabels( nodein, [ label ] ) YIELD node
RETURN node

// Manual inferring
CALL db.labels()
YIELD label as infered_label
WITH infered_label
MATCH (n:owl__Class {n10s_label: infered_label}) <-[:rdfs__subClassOf*]- (sub:owl__Class) 
WITH sub.n10s_label as label, infered_label
// Get all nodes with label corresponding to the subclass, as defined above
MATCH (nodein) WHERE label IN labels(nodein)
// Add the "super" label
CALL apoc.create.addLabels( nodein, [ infered_label ] ) YIELD node
RETURN node

//    _____  ______ ____  _    _  _____ 
//   |  __ \|  ____|  _ \| |  | |/ ____|
//   | |  | | |__  | |_) | |  | | |  __ 
//   | |  | |  __| |  _ <| |  | | | |_ |
//   | |__| | |____| |_) | |__| | |__| |
//   |_____/|______|____/ \____/ \_____|
//                                      
//         



CALL db.labels()
YIELD label as infered_label
WITH infered_label
MATCH path = (n:owl__Class {n10s_label: infered_label}) <-[:rdfs__subClassOf*]- (sub:owl__Class) 
WITH sub.n10s_label as label, infered_label, path
RETURN DISTINCT infered_label, label, path

// Test inheritance between EventSpec <- Event

MATCH path = (event_spec:owl__Class) -[:rdfs__subClassOf*]-> (event_root:owl__Class {n10s_label:"oeev__Event"})
WITH [node IN nodes(path) | node.n10s_label ] AS output
RETURN output

// Step 1: iterate over all owl__Class to then set inheritance
MATCH path = (event_spec:owl__Class ) -[:rdfs__subClassOf*2..]-> (event_root:owl__Class)
WITH [node IN nodes(path) | node.n10s_label ] AS all_labels, event_spec
// Step 2: label every node (individuals)
MATCH (individual) WHERE event_spec.n10s_label IN labels(individual)
CALL apoc.create.addLabels( individual, all_labels ) YIELD node
RETURN node

// Debug ScientificObject
MATCH path = (event_spec:owl__Class ) -[:rdfs__subClassOf*1..]-> (event_root:owl__Class {n10s_label: "oeso__ScientificObject"})
WITH [node IN nodes(path) | node.n10s_label ] AS all_labels, event_spec
RETURN all_labels
// Step 2: label every node (individuals)
MATCH (individual) WHERE event_spec.n10s_label IN labels(individual)
CALL apoc.create.addLabels( individual, all_labels ) YIELD node
RETURN node

// SPec for Fertilization
CALL n10s.inference.nodesLabelled("oeev__Fertilization",  {
  catNameProp: "n10s_label",
  catLabel: "owl__Class",
  subCatRel: "rdfs__subClassOf"
})
YIELD node
RETURN node
// Only the upper most is inferred !

WITH "oeev__Event" as infered_label
MATCH path = (n:owl__Class {n10s_label: infered_label}) <-[:rdfs__subClassOf*]- (sub:owl__Class) 
WITH sub.n10s_label as label, infered_label, path
RETURN DISTINCT infered_label, label, path


MATCH (n:owl__Class ) WHERE n.rdfs__label CONTAINS "cientific" RETURN n
MATCH (n:owl__Class {n10s_label:"oeev__Event"}) <-[:rdfs__subClassOf*]- (sub:owl__Class) RETURN DISTINCT n.n10s_label, sub.n10s_label 

MATCH (n:owl__Class {n10s_label:"oeev__Event"}) <-[:rdfs__subClassOf*]- (sub:owl__Class {n10s_label:"oeev__Fertilization"}) RETURN *  
MATCH (n:owl__Class {n10s_label:"oeev__Event"}) <-[:rdfs__subClassOf*]- (sub:owl__Class {n10s_label:"oeev__Move"}) RETURN *  

MATCH (n:owl__Class {n10s_label:"oeev__Event"}) <-[:rdfs__subClassOf*]- (sub:owl__Class) 
WHERE label IN labels(n)
WITH sub.n10s_label as infered_label
MATCH (nodein) WHERE infered_label IN labels(nodein)
CALL apoc.create.addLabels( nodein, [ "oeev__Event" ] ) YIELD node
RETURN node

CREATE (n:oeev__Move {name: 'test'})
MATCH (n:oeev__Move {name: 'test'}) DELETE n

MATCH (n:owl__Class) RETURN n.n10s_label
CALL n10s.inference.nodesLabelled("oeev__Event",  {
  catNameProp: "n10s_label",
  catLabel: "owl__Class",
  subCatRel: "rdfs__subClassOf"
})
YIELD node
WITH node
RETURN node.identifier as id, node.title as title, labels(node) as categories;
