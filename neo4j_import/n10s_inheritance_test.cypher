// 
CREATE (a:Test:Class {class_label: "Living", class_uri: "__Living"})
CREATE (b:Test:Class {class_label: "Animal", class_uri: "__Animal"}) -[:rdfs__subClassOf]-> (a)
CREATE (c:Test:Class {class_label: "Human", class_uri: "__Human"}) -[:rdfs__subClassOf]-> (b)

CREATE (me:Human:Test {name:"Toto"})

CALL n10s.inference.nodesLabelled('Living',  {
  catNameProp: "class_label",
  catLabel: "Class",
  subCatRel: "rdfs__subClassOf"
})
YIELD node
RETURN node;


// Neo4j example 

CREATE (c:LCSHTopic { authoritativeLabel: "Crystallography", dbLabel: "Crystallography", identifier: "sh 85034498" })
CREATE (po:LCSHTopic { authoritativeLabel: "Physical optics", dbLabel: "PhysicalOptics", identifier: "sh 85095187" })
CREATE (s:LCSHTopic { authoritativeLabel: "Solids", dbLabel: "Solids", identifier: "sh 85124647" })
CREATE (c)<-[:NARROWER_THAN]-(:LCSHTopic { authoritativeLabel: "Crystal optics", dbLabel: "CrystalOptics", identifier: "sh 85034488" })-[:NARROWER_THAN]->(po)
CREATE (c)<-[:NARROWER_THAN]-(:LCSHTopic { authoritativeLabel: "Crystals", dbLabel: "Crystals", identifier: "sh 85034503" })-[:NARROWER_THAN]->(s)
CREATE (c)<-[:NARROWER_THAN]-(:LCSHTopic { authoritativeLabel: "Dimorphism (Crystallography)", dbLabel: "DimorphismCrystallography", identifier: "sh 2007001101" })
CREATE (c)<-[:NARROWER_THAN]-(:LCSHTopic { authoritativeLabel: "Isomorphism (Crystallography)", dbLabel: "IsomorphismCrystallography", identifier: "sh 85068653" })

CREATE (:Book:CrystalOptics { title: "Crystals and light", identifier: "2167673"})
CREATE (:Book:CrystalOptics { title: "Optical crystallography", identifier: "11916857"})

CREATE (:Book:IsomorphismCrystallography { title: "Isomorphism in minerals", identifier: "8096161"})

CREATE (:Book:Crystals { title: "Crystals and life", identifier: "12873809"})
CREATE (:Book:Crystals { title: "Highlights in applied mineralogy", identifier: "20234576"})


CALL n10s.inference.nodesLabelled('Crystallography',  {
  catNameProp: "dbLabel",
  catLabel: "LCSHTopic",
  subCatRel: "NARROWER_THAN"
})
YIELD node
RETURN node.identifier as id, node.title as title, labels(node) as categories;

MATCH (n:Book) DETACH DELETE n
MATCH (n:LCSHTopic) DETACH DELETE n