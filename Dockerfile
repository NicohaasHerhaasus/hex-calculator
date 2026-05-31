# Use a lightweight Nginx web server image
FROM nginx:alpine

# Copy our frontend GUI files into the web server's public folder
COPY ./calculator.html /usr/share/nginx/html/index.html
COPY ./calculator.js /usr/share/nginx/html/calculator.js

# Expose port 80 to the outside world
EXPOSE 80