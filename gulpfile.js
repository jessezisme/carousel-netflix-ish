var gulp = require("gulp");
var noop = require("gulp-noop");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var minify = require("gulp-minify");
var uglify = require("gulp-uglify");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("gulp-cssnano");
var watch = require("gulp-watch");
var browserSync = require("browser-sync").create();
var shell = require("gulp-shell");

/*=============================================
=            config            =
=============================================*/
/**
 * set path and environment variables,
 * which are used to determine whether files should be minified, etc... *
 */
var config = {
    assets_src: "./src/",
    assets_dist: "./dist/",
    env: process.env.NODE_ENV === "production" ? "production" : "development",
    env_prod: process.env.NODE_ENV === "production" ? true : false
};
console.log("Environment running in Gulp: " + config.env);

/*=====  End of config  ======*/

/*=============================================
=            JS            =
=============================================*/
gulp.task("js", function() {
    return (
        gulp
            .src([config.assets_src + "js/main.js"], {
                base: config.assets_src
            })
            // .pipe(sourcemaps.init())
            // .pipe(sourcemaps.identityMap())
            .pipe(
                babel({
                    presets: ["env"]
                })
            )
            .pipe(
                // only minifiy if in prod; run noop() to just pass stream through using noop()
                config.env_prod ? minify() : noop()
            )
            // .pipe(sourcemaps.write())
            .pipe(concat("main.js"))
            .pipe(
                // only uglify if in prod; run noop() to just pass stream through using noop()
                config.env_prod ? uglify() : noop()
            )
            .pipe(gulp.dest(config.assets_dist + "js"))
    );
});
/*=====  End of JS  ======*/

/*=============================================
=            SCSS/CSS            =
=============================================*/
gulp.task("sass", function() {
    return gulp
        .src([config.assets_src + "style/**/*.scss"], {
            base: config.assets_src
        })
        .pipe(sass().on("error", sass.logError))
        .pipe(
            postcss([
                autoprefixer({
                    browsers: ["last 10 versions"],
                    cascade: false
                })
            ])
        )
        .pipe(cssnano())
        .pipe(gulp.dest(config.assets_dist));
});

/*=====  End of SCSS/CSS  ======*/

/*=============================================
=            Serve & Watch          =
=============================================*/
gulp.task("serve-watch", function() {
    browserSync.init({
        server: {
            baseDir: "./",
            index: "index.html"
        },
        // proxy: "http://localhost:4000/",
        browser: [
            // "firefoxdeveloperedition",
            // "google chrome"
        ],
        reloadDebounce: 5000
    });

    watch([config.assets_src + "js/**/*.js"], gulp.series("js"));

    watch([config.assets_src + "style/**/*.scss"], gulp.series("sass"));

    // watch(
    //     [config.assets_src + 'img/**/*'],
    //     gulp.series('img', 'webp')
    // );

    watch([config.assets_dist + "**/*"], function() {
        return browserSync.reload();
    });
});

/*=====  End of Serve & Watch  ======*/

/*=============================================
=            Default            =
=============================================*/
gulp.task("default", gulp.series("js", "sass", "serve-watch"));
/*=====  End of Default  ======*/
