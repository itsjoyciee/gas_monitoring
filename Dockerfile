FROM php:8.2-apache

# 1. Install system dependencies
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
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring gd xml intl

# 2. Install Composer (pinned to stable version)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --version=2.7.1

# 3. Set working directory
WORKDIR /var/www/html

# 4. DEBUG: Verify working directory exists
RUN ls -la /var/www

# 5. Copy ONLY composer files first
COPY composer.json composer.lock ./

# 6. DEBUG: Verify files were copied
RUN ls -la && pwd

# 7. Install dependencies with increased memory limit
RUN composer install --no-dev --no-interaction --optimize-autoloader

# 8. Copy remaining files
COPY . .

# 9. DEBUG: Verify full directory structure
RUN ls -la /var/www/html

# 10. Apache configuration
RUN a2enmod rewrite
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# 11. Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

EXPOSE 80
