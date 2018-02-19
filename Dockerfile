FROM mhart/alpine-node:8
WORKDIR /app
#COPY .  .
# RUN npm install --production
RUN ls
EXPOSE 3000
CMD ["nodemon", "./bin/www"]
