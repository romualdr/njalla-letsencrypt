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
ENV NJALLA_API_KEY=not_an_actual_api_key
EXPOSE 80

COPY ./ ./

ENTRYPOINT [ "nohup", "npm", "run", "start" ]
