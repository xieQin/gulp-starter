/**
 * 组件安装
 * npm install
 */

 // 引入 gulp及组件
var gulp    = require('gulp'),                 //基础库
    imagemin = require('gulp-imagemin'),       //图片压缩
    less = require('gulp-less'),               //less
    minifycss = require('gulp-minify-css'),    //css压缩
    jshint = require('gulp-jshint'),           //js检查
    uglify  = require('gulp-uglify'),          //js压缩
    rename = require('gulp-rename'),           //重命名
    concat  = require('gulp-concat'),          //合并文件
    rev = require('gulp-rev'),                 //md5
    revCollector = require('gulp-rev-collector'),
    changed = require('gulp-changed'),
    gulpSequence = require('gulp-sequence'),
    del = require('del'),
    spritesmith = require('gulp.spritesmith'),
    optimize = require('gulp-htmloptimize'),
    htmlmin = require('gulp-htmlmin');

// HTML处理
gulp.task('html', function() {
    var htmlSrc = './src/*.html',
        htmlDst = './dist/';

    return gulp.src(htmlSrc)
        .pipe(changed(htmlDst))
        .pipe(gulp.dest(htmlDst));
});

gulp.task('g-html', function() {
    var htmlSrc = './dist/*.html',
        htmlDst = './build/';

    return gulp.src(htmlSrc)
        .pipe(changed(htmlDst))
        .pipe(optimize())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(htmlDst));
});

// 样式处理
gulp.task('css', function () {
    var cssSrc = './src/less/*.less',
        cssDst = './dist/css';

    return gulp.src(cssSrc)
        .pipe(less())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./src/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(cssDst))
});

gulp.task('g-css', function () {
    var cssSrc = './dist/css/*.css',
        cssDst = './build/css';

    return gulp.src(cssSrc)
        .pipe(minifycss())
        .pipe(rev())
        .pipe(gulp.dest(cssDst))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'));
});

gulp.task('sprites', function() {
    var data =
        gulp.src('./src/images/icons/*.png')
            .pipe(spritesmith({
                cssName: 'sprites.css',
                imgName: '../images/sprites.png',
            }));

    data.img.pipe(gulp.dest('./dist/images/'));
    data.css.pipe(gulp.dest('./dist/css'));
})

//图片处理
gulp.task('images', function(){
    var imgSrc = './src/images/**/*.*',
        imgDst = './dist/images';

    return gulp.src(imgSrc)
        .pipe(changed(imgDst))
        .pipe(gulp.dest(imgDst))
})

gulp.task('g-images', function(){
    var imgSrc = './dist/images/**/*',
        imgDst = './build/images';

    return gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(rev())
        .pipe(gulp.dest(imgDst))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/images'));;
})

//js处理
gulp.task('js', function () {
    var jsSrc = './src/js/*.js',
        jsDst ='./dist/js';

    return gulp.src(jsSrc)
        .pipe(concat('main.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(jsDst))
});

gulp.task('g-js', function () {
    var jsSrc = './dist/js/**/*.js',
        jsDst ='./build/js';

    return gulp.src(jsSrc)
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(jsDst))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js'));
});

//vendor处理
gulp.task('vendor', function() {
    var baseSrc = './node_modules';
        vendorSrc = [
            './node_modules/html5shiv/src/html5shiv.js',
            './node_modules/jquery/dist/jquery.js'
        ],
        vendorDst = './dist/js';

    return gulp.src(vendorSrc)
        .pipe(concat('vendor.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(vendorDst))
})

//md5文件名替换
gulp.task('rev-html', function() {

    return gulp.src(['./rev/**/*.json', './build/*.html'])    //- 读取 rev-manifest.json 文件以及需要进行替换的文件
        .pipe(revCollector({                                //- 执行文件内的替换
            replaceReved: true
        }))
        .pipe(gulp.dest('./build'));                         //- 替换后的文件输出的目录
});

gulp.task('rev-css', function() {

    return gulp.src(['./rev/images/*.json', './build/css/*.*'])    //- 读取 rev-manifest.json 文件以及需要进行替换的文件
        .pipe(revCollector({                                //- 执行文件内的替换
            replaceReved: true
        }))
        .pipe(gulp.dest('./build/css'));                         //- 替换后的文件输出的目录
});

// 清空图片、样式、js、rev
gulp.task('clean', function() {
    return del([
        './dist/*.html',
        './dist/css/**/*',
        './dist/js/*',
        './dist/images/**/*'
    ]);
});

gulp.task('g-clean', function() {
    return del([
        './rev/**/*',
        './build/**/*.*'
    ]);
});

// 默认任务 清空图片、样式、js并重建 运行语句 gulp
gulp.task('default', function(cb){
    gulpSequence(
        'clean',
        'html',
        'css',
        'images',
        'sprites',
        'js',
        'vendor',
        cb
    );
});

// 监听任务 运行语句 gulp watch
gulp.task('watch',function(){

    // livereload.listen();

    gulp.watch('src/*.html', ['html']);

    gulp.watch('src/js/**/*.js', ['js']);

    gulp.watch('src/less/**/*.less', ['css']);

    gulp.watch('src/images/**/*.png', function(cb) {
        gulpSequence(
            'images',
            'sprites',
            cb
        )
    });

});

gulp.task('build', function(cb) {
    gulpSequence(
        'default',
        'g-clean',
        'g-html',
        'g-css',
        'g-images',
        'g-js',
        'rev-html',
        'rev-css',
        cb
    );
})