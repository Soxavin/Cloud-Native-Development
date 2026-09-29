FROM nginx:alpine

# Clear out NGINX's default welcome page so only our site is served
RUN rm -rf /usr/share/nginx/html/*

# Copy the whole site into NGINX's web root
COPY . /usr/share/nginx/html

# Document the port NGINX listens on inside the container
EXPOSE 80

# Run NGINX in the foreground so the container stays alive
CMD ["nginx", "-g", "daemon off;"]