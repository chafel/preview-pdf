var path     =   require('path'),
    concat   =   require('gulp-concat'),
    uglify   =   require('gulp-uglify'),
    rename   =   require('gulp-rename');


module.exports = function(gulp, opts, deps) {

	var taskName = path.basename(__filename, '.gulpfile.js');

    console.log('regist task [%s]', taskName);

    gulp.task(taskName, deps, function(){

    	var gulpSrc = gulp.src(opts.src).pipe(concat(opts.releaseName || 'release.js'));

        if(opts.uglify){
        	gulpSrc = gulpSrc.pipe(uglify());
        }

    	return gulpSrc.pipe(gulp.dest(opts.target));
    });

    console.log('[%s] is finished', taskName);
    return taskName;
};