FROM mysql:5.7

COPY ./permission.sql /docker-entrypoint-initdb.d/

RUN chmod 755 /docker-entrypoint-initdb.d/permission.sql 