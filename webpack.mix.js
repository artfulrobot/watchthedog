let mix = require('laravel-mix');
mix
.js('js-src/wtd.js', 'js/')
.sass('sass/wtd.scss', 'css/')
.vue({version: 2})
;
