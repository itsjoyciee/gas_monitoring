FROM php:8.2-apache

# Install dependencies, including Composer and necessary PHP extensions
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libicu-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring gd xml intl

# Install Composer (latest version)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www/html

# Copy all files into container
COPY . .

# Clear Composer cache (optional) and install PHP dependencies with verbose output
RUN composer clear-cache \
    && composer install --no-dev --verbose

# Enable mod_rewrite
RUN a2enmod rewrite

# Set Apache document root (optional for frameworks like Laravel)
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# Expose port 80 (default for Apache)
EXPOSE 80
