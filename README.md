# Memory Underground

Convert a list of memories into a subway map http://memoryunderground.com/

## Requirements

* PHP 5.4+
* MySQL 5.1+ database
* Sass (optional)

## Quick Start

* Configure your database settings at [application/config/database.php](application/config/database.php)
* Create a MySQL database with the settings entered above
* (optional) Run `sass --watch scss:css --style compressed` on the `assets` directory if you want to edit the styles via scss
* Go to [http://localhost/migrate](http://localhost/migrate) to run the database migration

For production database settings (i.e. not local development server), create a new folder in `application/config` called `production`, and copy [application/config/database.php](application/config/database.php) into that folder with updated settings.
