// Retrieve named owl__Class
MATCH (n:owl__Class) WHERE EXISTS(n.rdfs__label) RETURN n LIMIT 25

CALL n10s.inference.nodesLabelled('oeev__Move',  {
  catNameProp: "dbLabel",
  catLabel: "LCSHTopic",
  subCatRel: "NARROWER_THAN"
})
YIELD node
RETURN node.identifier as id, node.title as title, labels(node) as categories;