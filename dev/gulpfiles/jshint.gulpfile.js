var path     =   require('path'),
    jshint   =   require('gulp-jshint'),
    concat   =   require('gulp-concat'),
    uglify   =   require('gulp-uglify'),
    rename   =   require('gulp-rename'),
    tmodjs   =   require('gulp-tmod');


module.exports = function(gulp, opts, deps) {

    var taskName = path.basename(__filename, '.gulpfile.js', deps);

    console.log('regist task [%s]', taskName);

    gulp.task(taskName, deps, function(){

        console.log(opts.src);

        var stream = gulp.src(opts.src)
                .pipe(jshint())
                .pipe(jshint.reporter('default'));

        stream.on('end',function(){
            console.log('---------jshint end------------');
        });

    	return stream;
    });

    return taskName;
};

