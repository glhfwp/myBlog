const Compiler = require("./Compiler");
const options = require("./webpack.config");
new Compiler(options).run();