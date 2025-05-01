FROM php:8.2-apache

# Install only essential PHP extensions (no Composer)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

# Set working directory
WORKDIR /var/www/html

# Copy all files
COPY . .

# Enable Apache modules
RUN a2enmod rewrite

# Configure Apache to serve from root (not /public)
ENV APACHE_DOCUMENT_ROOT /var/www/html
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
