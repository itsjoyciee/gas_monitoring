FROM php:8.2-cli
WORKDIR /app
COPY . .
RUN composer install --no-dev
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN a2enmod rewrite
EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
