
// Add n10s_label property to owl__Class, to match label naming convention
CALL n10s.nsprefixes.list()
YIELD prefix, namespace
WITH prefix, namespace
MATCH (class:owl__Class) WHERE EXISTS(class.rdfs__label) AND class.uri STARTS WITH namespace
WITH class, prefix, namespace
WITH REPLACE(apoc.text.capitalizeAll(class.rdfs__label) , ' ', '') AS captilizedLabel, class, prefix, namespace
SET class.n10s_label = prefix + '__' + captilizedLabel
RETURN class

// Step 1: iterate over all owl__Class to then set inheritance
MATCH path = (event_spec:owl__Class) -[:rdfs__subClassOf*1..]-> (event_root:owl__Class)
WITH [node IN nodes(path) | node.n10s_label ] AS all_labels, event_spec
// Step 2: label every node (individuals)
MATCH (individual) WHERE event_spec.n10s_label IN labels(individual)
CALL apoc.create.addLabels( individual, all_labels ) YIELD node
RETURN node