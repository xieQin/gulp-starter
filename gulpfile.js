/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-less gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean gulp-livereload tiny-lr gulp-rev-collector gulp-rev --save-dev
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
    clean = require('gulp-clean'),             //清空文件夹
    tinylr = require('tiny-lr'),               //livereload
    server = tinylr(),
    port = 35729,
    rev = require('gulp-rev'),                 //md5
    livereload = require('gulp-livereload'),   //livereload
    revCollector = require('gulp-rev-collector'),
    changed = require('gulp-changed'),
    runSequence = require('run-sequence'),
    del = require('del'),
    cache = require('gulp-cached');

// HTML处理
gulp.task('html', function() {
    var htmlSrc = './src/*.html',
        htmlDst = './dist/';

    return gulp.src(htmlSrc)
        // .pipe(livereload(server))
        .pipe(cache('htmling'))
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
        // .pipe(minifycss())
        .pipe(rev())
        // .pipe(livereload(server))
        .pipe(cache('cssing'))
        .pipe(gulp.dest(cssDst))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'));
});

//图片处理
gulp.task('images', function(){
    var imgSrc = './src/images/**/*.*',
        imgDst = './dist/images';

    return gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(rev())
        // .pipe(livereload(server))
        .pipe(cache('imging'))
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
        // .pipe(uglify())
        .pipe(rev())
        // .pipe(livereload(server))
        .pipe(cache('jsing'))
        .pipe(gulp.dest(jsDst))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js'));
});

//vendor处理
gulp.task('vendor', function() {
    // var baseSrc = './node_modules';
    //     vendorSrc = [
    //         './node_modules/html5shiv/src/html5shiv.js',
    //         './node_modules/jquery/dist/jquery.js'
    //     ],
    //     vendorDst = './dist/js';

    // return gulp.src(vendorSrc)
    //     .pipe(concat('vendor.js'))
    //     .pipe(cache('vendoring'))
    //     .pipe(rename({ suffix: '.min' }))
    //     // .pipe(uglify())
    //     .pipe(rev())
    //     .pipe(gulp.dest(vendorDst))
    //     .pipe(rev.manifest())
    //     .pipe(gulp.dest('./rev/vendor'));
})

//md5文件名替换
gulp.task('rev', ['html', 'css', 'js', 'images', 'vendor'], function() {

    return gulp.src(['./rev/**/*.json', './src/*.html'])    //- 读取 rev-manifest.json 文件以及需要进行替换的文件
        .pipe(revCollector({                                //- 执行文件内的替换
            replaceReved: true
        }))                                             
        .pipe(gulp.dest('./dist'));                         //- 替换后的文件输出的目录 
});

gulp.task('boilerplate', function() {
    return gulp.src(['./src/*.txt'])
        .pipe(gulp.dest('./dist'));
})

// 清空图片、样式、js、rev
gulp.task('clean', function() {
    return gulp.src(['./dist/*.html','./dist/css/*.css', './dist/js/*.js', './dist/images/**/*', './rev/**/*'], {read: false})
        .pipe(clean());
});

// 默认任务 清空图片、样式、js并重建 运行语句 gulp
gulp.task('default', ['clean'], function(){
    gulp.start('html', 'css','images','js', 'vendor', 'rev');
});

// 监听任务 运行语句 gulp watch
gulp.task('watch',function(){

    gulp.run('default');

    livereload.listen();

    gulp.watch(['src/*.html', 'src/less/*.less', 'src/images/**/*.*', 'src/js/*.js'], ['htmling, cssing, jsing, imging, vendoring'], function(){
        gulp.watch('rev');
        // livereload.changed(file.path);
    })

});

gulp.task('bulid', function() {

})