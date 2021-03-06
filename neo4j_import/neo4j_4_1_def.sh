#! /bin/bash

docker run \
    -d \
    --name neo4j_opensilex \
    --publish=7687:7687 --publish=7474:7474\
    -v $HOME/neo4j/import:/var/lib/neo4j/import \
    -v $HOME/neo4j/neo4j_opensilex/data:/data \
    -v $HOME/neo4j/neo4j_opensilex/backups:/var/lib/neo4j/backups \
    -v $HOME/neo4j/neo4j_opensilex/logs:/logs \
    -v $HOME/neo4j/neo4j_opensilex/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/hades666 \
    --env NEO4J_dbms_allow__upgrade=true \
    --env NEO4J_dbms_security_procedures_unrestricted=apoc.\\\*,gds.\\\*,n10s.\\\*  \
    --env NEO4J_dbms_security_procedures_whitelist=apoc.\\\*,gds.\\\*,n10s.\\\* \
    --env NEO4J_apoc_export_file_enabled=true \
    --env NEO4J_apoc_import_file_enabled=true \
    --env NEO4J_dbms_directories_import=import \
    --env NEO4J_apoc_import_file_use__neo4j__config=false \
    neo4j:4.1.10


# Up to date version

docker run \
    -d \
    --name neo4j_opensilex \
    --publish=7687:7687 --publish=7474:7474 \
    -v $HOME/neo4j/import:/var/lib/neo4j/import \
    -v $HOME/neo4j/opensilex/data:/data \
    -v $HOME/neo4j/opensilex/backups:/var/lib/neo4j/backups \
    -v $HOME/neo4j/opensilex/logs:/logs \
    --env NEO4J_AUTH=neo4j/hades666 \
    --env 'NEO4JLABS_PLUGINS=[\"apoc\", \"n10s\"]'  \
    neo4j:4.1.10