'use strict';
var gulp = require('gulp'), //加载gulp包
	assetRev = require('gulp-asset-rev'), //添加文字图片hash值
	rev = require('gulp-rev'), //添加css/js版本号到.json文件中
	less = require('gulp-less'), //less编译
	revCollector = require('gulp-rev-collector'), //添加html版本号
	minifyCss = require('gulp-minify-css'), //压缩css
	minifyHtml = require('gulp-minify-html'), //压缩html
	concat = require('gulp-concat'), //合并文件
	runSequence = require('run-sequence'), //按顺序执行任务
	uglify = require('gulp-uglify'), //压缩js
	imagemin = require('gulp-imagemin'), //优化图片
	rename = require('gulp-rename'), //重命名
	cache = require('gulp-cache'), //只压缩修改的图片
	pngquant = require('imagemin-pngquant'), //使用pngquant深度压缩png图片的imagemin插件
	pump = require('pump'),
	obfuscate = require('gulp-obfuscate');//js混淆

//less编译，合并，压缩
gulp.task('less', function() {
	return gulp.src('develop/less/*.less')
		.pipe(less())
		.pipe(concat('default.min.css'))
		.pipe(minifyCss())
		.pipe(gulp.dest('develop/css'));
});

//js压缩
gulp.task('uglify', function(cb) {
	pump([
		gulp.src('develop/js/*.js'),
//		concat('default.min.js'),
		uglify(),
		obfuscate(),
		gulp.dest('dist/js')
	], cb)
});

//html压缩
gulp.task('minifyHtml', function() {
	var options = {
		collapseWhitespace: true, //从字面意思应该可以看出来，清除空格，压缩html，这一条比较重要，作用比较大，引起的改变压缩量也特别大。
		collapseBooleanAttributes: true, //省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>。
		removeComments: true, //清除html中注释的部分，我们应该减少html页面中的注释。
		removeEmptyAttributes: true, //清除所有的空属性。
		removeScriptTypeAttributes: true, //清除所有script标签中的type="text/javascript"属性。
		removeStyleLinkTypeAttributes: true, //清除所有Link标签上的type属性。
		minifyJS: true, //压缩html中的javascript代码。
		minifyCSS: true //压缩html中的css代码。
	};
	return gulp.src('develop/*.html')
		.pipe(minifyHtml(options))
		.pipe(gulp.dest('dist/'))
});

//添加文字图片hash值
gulp.task('assetRev', function() {
	return gulp.src('develop/css/*.css')
		.pipe(assetRev())
		.pipe(minifyCss())
		.pipe(gulp.dest('dist/css/'));
});

//添加css版本号到.json文件中
gulp.task('revCss', function() {
	return gulp.src(['develop/css/*.css', '!develop/css/_*.css'])
		.pipe(rev())
		.pipe(rev.manifest())
		.pipe(gulp.dest('dist/rev/css'));
});

//添加js版本号到.json文件中
gulp.task('revJs', function() {
	return gulp.src('develop/js/*.js')
		.pipe(rev())
		.pipe(rev.manifest())
		.pipe(gulp.dest('dist/rev/js'));
});

//添加新的版本号到html
gulp.task('revCollector', function() {
	return gulp.src(['dist/rev/**/*.json', 'dist/*.html'])
		.pipe(revCollector())
//		.pipe(minifyHtml())
		.pipe(gulp.dest('dist/'));
});

//图片优化
gulp.task('imageMin', function() {
	return gulp.src('develop/images/*.{png,jpg,gif,ico}')
		.pipe(cache(imagemin({
			optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
			progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
			interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
			multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
			svgoPlugins: [{
				removeViewBox: false
			}], //不要移除svg的viewbox属性
			use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
		})))
		.pipe(gulp.dest('dist/images'));
});

//按顺序执行任务
gulp.task('runSequence', function(done) {
	runSequence(
		['less'], ['minifyHtml'], ['uglify'], ['imageMin'], ['assetRev'], ['revCss'], ['revJs'], ['revCollector'],
		done);
});

//监听改变的文件
gulp.task('watch',function(){
	gulp.watch('develop/less/*.less',['less']);
	gulp.watch('develop/*.html',['minifyHtml']);
	gulp.watch('develop/js/*.js',['uglify']);
	gulp.watch('develop/images/*.{png,jpg,gif,ico}',['imageMin']);
	gulp.watch('develop/css/*.css',['assetRev']);
	gulp.watch('develop/css/*.css',['revCss']);
	gulp.watch('develop/js/*.js',['revJs']);
	gulp.watch('dist/rev/**/*.json',['revCollector']);
});
