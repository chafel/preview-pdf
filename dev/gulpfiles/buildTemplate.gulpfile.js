var path = require('path'),
    tmodjs = require('gulp-tmod');
watch = require('gulp-watch');


module.exports = function(gulp, opts, deps) {

    var taskName = path.basename(__filename, '.gulpfile.js');
    
    taskName += '_[' + opts.src.join(',') + ']';

    console.log('regist task [%s]', taskName);

    gulp.task(taskName, deps, function() {

        var tmodOpts = {
            base: opts.tplBase,
            output: opts.target
        };

        if (opts.enableWatch) {
            //watch tpl files change
            watch(opts.src, function() {
                console.log('event: files change!');
                gulp.src(opts.src).pipe(tmodjs(tmodOpts));
            });
        } else {
            // run once
            return gulp.src(opts.src).pipe(tmodjs(tmodOpts));
        }
    });

    return taskName;

};
