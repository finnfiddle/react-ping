/* eslint-disable prefer-arrow-callback */
import ResourceFragment from '../ResourceFragment';
import { assert } from 'chai';

describe('ResourceFragment', function () {

  it('.getReducer()', function () {
    const fragment = ResourceFragment('test', {});
    const reducer = fragment.getReducer('test');
    assert.deepEqual(
      reducer([], { type: 'test::LIST_SUCCESS', payload: [{ id: 'foo' }] }),
      [{ id: 'foo' }]
    );
    assert.deepEqual(
      reducer([], { type: 'test::CREATE_SUCCESS', payload: { id: 'foo' } }),
      [{ id: 'foo' }]
    );
    assert.deepEqual(
      reducer([{ id: 'foo' }], { type: 'test::READ_SUCCESS', payload: { id: 'foo', bar: 'baz' } }),
      [{ id: 'foo', bar: 'baz' }]
    );
    assert.deepEqual(
      reducer(
        [{ id: 'foo', bar: 'baz' }],
        { type: 'test::UPDATE_SUCCESS', payload: { id: 'foo', bar: 'jazz' } }
      ),
      [{ id: 'foo', bar: 'jazz' }]
    );
    assert.deepEqual(
      reducer([{ id: 'foo' }], { type: 'test::DEL_SUCCESS', payload: { id: 'foo' } }),
      []
    );
  });

});
