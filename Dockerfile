FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Install dependencies, including Composer
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    && curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

# Copy all files into container
COPY . .

# Install PHP dependencies (optional: only if composer.json is present)
RUN composer install --no-dev

# Enable mod_rewrite (optional but useful)
RUN a2enmod rewrite

# Expose port 80 (default for Apache)
EXPOSE 80
