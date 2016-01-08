var path = require('path'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css');

module.exports = function(gulp, opts, deps) {

    var taskName = path.basename(__filename, '.gulpfile.js');

    taskName += '_[' + opts.src.join ? opts.src.join(',') : opts.src + ']';
    
    console.log('regist task [%s]', taskName);

    gulp.task(taskName, deps , function() {
        var gulpSrc = gulp.src(opts.src);

        if (opts.minify) {
            console.log('minify css of %s', taskName);
            gulpSrc = gulpSrc.pipe(minifyCss());
        }

        return gulpSrc.pipe(concat(opts.releaseName || 'release.css')).pipe(gulp.dest(opts.target));
    });

    return taskName;
};
