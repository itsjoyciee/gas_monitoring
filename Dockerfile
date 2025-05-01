FROM php:8.2-apache

# Install dependencies, including Composer
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    libpng-dev libjpeg-dev libfreetype6-dev \
    && curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

# Install necessary PHP extensions (e.g., pdo_mysql, mbstring, gd)
RUN docker-php-ext-install pdo pdo_mysql mbstring gd

# Set working directory
WORKDIR /var/www/html

# Copy all files into container
COPY . .

# Install PHP dependencies
RUN composer install --no-dev

# Enable mod_rewrite
RUN a2enmod rewrite

# Expose port 80
EXPOSE 80
