#!/usr/bin/env nodejs
// adapted from https://gist.github.com/kristopherjohnson/5065599

var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

var canonicalJSON = require('./index')

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    var inputJSON = inputChunks.join();
    var outputJSON = canonicalJSON(JSON.parse(inputJSON), null, 4);
    stdout.write(outputJSON);
    stdout.write('\n');
});
