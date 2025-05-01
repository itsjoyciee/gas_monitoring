FROM php:8.2-cli

# Copy files and install dependencies
WORKDIR /app
COPY . .
RUN composer install --no-dev

# Configure Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN a2enmod rewrite

EXPOSE 80
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
