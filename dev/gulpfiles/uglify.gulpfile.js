var path     =   require('path'),
    concat   =   require('gulp-concat'),
    uglify   =   require('gulp-uglify'),
    rename   =   require('gulp-rename');


module.exports = function(gulp, opts, deps) {

	var taskName = path.basename(__filename, '.gulpfile.js');

    console.log('regist task [%s]', taskName);

    gulp.task(taskName, deps, function(){
    	return gulp.src(opts.src)
                .pipe(uglify())
                .pipe(gulp.dest(opts.target));
    });

    console.log('[%s] is finished', taskName);
    return taskName;
};