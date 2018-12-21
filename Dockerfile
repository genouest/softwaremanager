FROM node:8-jessie

RUN apt-get update && apt-get install -y vim

RUN mkdir -p /root/softmngr
WORKDIR /root/softmngr

COPY *.json /root/softmngr/
RUN npm install

COPY *.js /root/softmngr/
COPY bin /root/softmngr/bin
COPY routes /root/softmngr/routes
COPY config /root/softmngr/config
COPY ui /root/softmngr/ui

ENTRYPOINT /root/softmngr/bin/www
