const fg = require('fast-glob');
const readdir = require('readdir-enhanced');

try {
    const stream = fg.stream(
        '/Users/rafalwolak/Dev/design4/**/*.code-workspace',
        {
            // cwd: '/Users/rafalwolak/Dev/design4/',
            ignore: ['**/node_modules/**'],
            onlyFiles: true,
            suppressErrors: true
        }
    );

    stream
        .on('data', path => console.log(path))
        .on('error', err => console.error(err))
        .on('end', function() {
            // This may not been called since we are destroying the stream
            // the first time 'data' event is received
            console.log('All the data in the file has been read');
        })
        .on('close', function(err) {
            console.log('Stream has been destroyed and file has been closed');
        });

    setTimeout(() => {
        stream.destroy('timout');
    }, 1000);
} catch (err) {
    console.log('some error', err);
}

function ignoreNodeModules(stats) {
    return stats.path.indexOf('node_modules') === -1;
}

// EventEmitter API
// readdir
//     .stream('/Users/rafalwolak/Dev/design4/extensions/', {
//         filter: '**/*.code-workspace',
//         deep: ignoreNodeModules
//     })
//     // .on('data', path => console.log(path))
//     .on('file', path => console.log(path))
//     .on('directory', path => console.log(path))
//     //   .on('symlink', function(path) { ... })
//     .on('error', err => console.error(err));

// var path = require('path');
// var fs = require('fs');

// const walk = (base, ext, files, result) => {
//     files = files || fs.readdirSync(base);
//     result = result || [];

//     files.forEach(file => {
//         const newbase = path.join(base, file);

//         fs.exists(newbase, exists => {
//             if (exists) {
//                 if (fs.statSync(newbase).isDirectory()) {
//                     fs.access(
//                         newbase,
//                         fs.constants.F_OK | fs.constants.W_OK,
//                         err => {
//                             if (!err) {
//                                 result = walk(
//                                     newbase,
//                                     ext,
//                                     fs.readdirSync(newbase),
//                                     result
//                                 );
//                             }
//                         }
//                     );
//                 } else if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
//                     result.push(newbase);
//                 }
//             }
//         });
//     });

//     return result;
// };

// ext_file_list = walk('/', 'code-workspace');

// console.log(ext_file_list);
