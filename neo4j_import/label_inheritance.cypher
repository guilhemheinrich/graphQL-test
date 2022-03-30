// Add n10s_label property to owl__Class, to match label naming convention
CALL n10s.nsprefixes.list()
YIELD prefix, namespace
WITH prefix, namespace
MATCH (class:owl__Class) WHERE EXISTS(class.rdfs__label) AND class.uri STARTS WITH namespace
SET class.n10s_label = prefix + '__' + REPLACE(class.rdfs__label, ' ', '')
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


//    _____  ______ ____  _    _  _____ 
//   |  __ \|  ____|  _ \| |  | |/ ____|
//   | |  | | |__  | |_) | |  | | |  __ 
//   | |  | |  __| |  _ <| |  | | | |_ |
//   | |__| | |____| |_) | |__| | |__| |
//   |_____/|______|____/ \____/ \_____|
//                                      
//         


// CALL n10s.inference.nodesLabelled("oeev__ScientificObjectManagement",  {
//   catNameProp: "n10s_label",
//   catLabel: "owl__Class",
//   subCatRel: "rdfs__subClassOf"
// })

// MATCH (n:owl_CLass {n10s_label: "oeev__ScientificObjectManagement"}) RETURN n