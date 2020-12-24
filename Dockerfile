#specify a base image from dockerhub
FROM node:14-alpine3.10


# all other commands will be executed relative to this directory
# our code will live here
# depending on your environment you may need to
# RUN mkdir -p /app
WORKDIR /app

# A wildcard ensures both package.json 
# and package-lock.json files are copied
COPY package*.json ./

# Install dependencies and clear npm cache
RUN npm install && npm cache clean --force

# If you are building your code for production
# RUN npm ci --only=production

# copy over all other files to the image and finally to the container
COPY . .

# use EXPOSE command to have our port mapped by the docker daemon
EXPOSE 5000

# our default dev command
CMD ["npm","run","dev"]

