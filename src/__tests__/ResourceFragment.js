/* eslint-disable prefer-arrow-callback */
import ResourceFragment from '../ResourceFragment';
import { assert } from 'chai';

describe('ResourceFragment', function () {

  it('.getReducer()', function () {
    const fragment = ResourceFragment('test', {});
    const reducer = fragment.getReducer();
    assert.equal(reducer([], { type: 'test::LIST_SUCCESS', payload: ['foo'] }), ['foo']);
  });

});
