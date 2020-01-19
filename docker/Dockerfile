#
# Modules
#
FROM node:13-alpine AS modules

RUN mkdir /app
WORKDIR /app
ADD package.json ./package.json
ADD package-lock.json ./package-lock.json
RUN npm install

#
# Application
#
FROM modules

# Add application
WORKDIR /app

ENV PORT=80
ENV HTTPREQ_USERNAME=
ENV HTTPREQ_PASSWORD=
ENV NJALLA_USERNAME=not_an_actual_account
ENV NJALLA_PASSWORD=not_an_actual_password
EXPOSE 80

COPY ./ ./

ENTRYPOINT [ "nohup", "npm", "run", "start" ]
