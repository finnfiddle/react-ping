import { combineReducers } from 'redux';

import Fragment from './Fragment';
import ResourceFragment from './ResourceFragment';

export default config => {
  const fragments = {};

  fragments.definitions = Object.keys(config).reduce((acc, key) => {
    const fragmentConfig = config[key];
    return Object.assign({}, acc, {
      [key]: fragmentConfig.isResource ?
        ResourceFragment(key, fragmentConfig) :
        Fragment(key, fragmentConfig),
    });
  }, {});

  fragments.listen = function (emitter) {
    Object.keys(fragments.definitions).forEach(key => {
      emitter.addListener(fragments.definitions[key]);
      fragments.definitions[key].addListener(emitter);
    });
  };

  fragments.getReducer = function () {
    return combineReducers(Object.keys(fragments.definitions).reduce((acc, key) =>
      Object.assign({}, acc, { [key]: fragments.definitions[key].getReducer(key) })
    , {}));
  };

  return fragments;
};
