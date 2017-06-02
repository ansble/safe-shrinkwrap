const cleanDependencies = function (depObject, testFunction) {
  return Object.keys(depObject).reduce(function (result, key) {
    if (!testFunction(key)) {
      if ( depObject[key].dependencies) {
        result[key] = depObject[key];
        result[key].dependencies = cleanDependencies(depObject[key].dependencies, testFunction);
      } else {
        result[key] = depObject[key];
      }
    }

    return result;
  }, {});
};

module.exports = cleanDependencies;