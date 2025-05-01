FROM php:8.2-apache

# Copy files and install dependencies
WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev

# Configure Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN a2enmod rewrite

EXPOSE 80
CMD ["apache2-foreground"]
