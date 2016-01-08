var path = require('path');
var clean = require('gulp-clean');


module.exports = function(gulp, opts, deps) {

    var taskName = path.basename(__filename, '.gulpfile.js');

    taskName += '_[' + opts.target.join ? opts.target.join(',') : opts.target + ']';

    console.log('regist task [%s]', taskName);

    gulp.task(taskName, deps, function() {
        console.log('clean : %s', opts.target);
        return gulp.src(opts.target, {
            read: false
        }).pipe(clean());
    });

    return taskName;
};
