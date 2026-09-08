const sass = require('sass');
const fse = require('fs-extra');

exports.onPostBootstrap = (_, configOptions) => {
    const result = sass.compile(configOptions.inputFile);
    fse.outputFileSync(configOptions.outputFile, result.css);
};
