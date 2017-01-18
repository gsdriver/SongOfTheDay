'use strict';

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const zip = require('gulp-zip');
const tap = require('gulp-tap');
const del = require('del');

gulp.task('build:prepare', ['clean'], () =>
  // copy only what we need for deployment
  gulp.src(['**/*', '!node_modules/**', '!node_modules', '!build/**', '!.gitignore', '!.idea', '!.idea/**', '!*.zip'], {dot: true})
    .pipe(gulp.dest('build/'))
);

gulp.task('zip', ['build:prepare', 'clean'], () => {
  const buildArtifact = ['build/**'];
  const pjson = require('./package.json');
  const zipFile = pjson.name + '.zip';
  return gulp.src(buildArtifact, {base: './build', dot: true})
        .pipe(tap(file => {
          if (file.isDirectory()) {
            file.stat.mode = parseInt('40777', 8);
          }
        }))
        .pipe(zip(zipFile))
        .pipe(gulp.dest('.'));
});

gulp.task('clean', () => {
  return del(['build/']);
});

gulp.task('build', ['clean', 'zip']);
gulp.task('default', ['build']);
