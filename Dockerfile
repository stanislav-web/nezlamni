
# Get image
FROM node:16-alpine3.14

# Get arguments and configs default values
ARG API_NAME
ARG LOGGER_LEVEL=error
ARG NODE_ENV=development
ARG CURRENT_VERSION=0.0.1
ARG HTTP_PORT=3000

# Add labels to mark container
LABEL PROJECT="${API_NAME}"
LABEL MAINTAINER="S-PRO Developers <exbay.pro@gmail.com>"
LABEL ENVIRONMENT="${NODE_ENV}"
LABEL VERSION="${CURRENT_VERSION}"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy application files into container with app
COPY . /usr/src/app/
COPY package*.json /usr/src/app/

# Install app dependencies inside container
ENV NPM_CONFIG_LOGLEVEL ${LOGGER_LEVEL}
ENV NODE_ENV ${CURRENT_ENVIRONMENT}
RUN npm install
RUN npm build

# Expose the listening port
EXPOSE ${HTTP_PORT}

# Run application inside container
ENTRYPOINT ["npm", "run start:${NODE_ENV}"]
