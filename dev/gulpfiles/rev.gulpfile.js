var path         =   require('path'),
    rev          =   require('gulp-rev'),
    sourcemaps   =   require('gulp-sourcemaps'),
    concat       =   require('gulp-concat'),
    dest         =  require('gulp-dest');

var taskName = path.basename(__filename, '.gulpfile.js');

module.exports = function(gulp, opts) {

    console.log('regist task [%s]', taskName);

    gulp.task(taskName, function(){
        return gulp.src(['','']) //需要哈希值的文件
                .pipe(sourcemaps.init())
                .pipe(concat({
                    path: 'bundle.js',
                    cwd: ''
                }))
                .pipe(rev())
                .pipe(sourcemaps.write('.'))
                .pipe(dest('')); //输出文件路径
    });

    console.log('[%s] is finished', taskName);
    return taskName;
};
