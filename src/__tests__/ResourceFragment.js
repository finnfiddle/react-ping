/* eslint-disable prefer-arrow-callback */
import ResourceFragment from '../ResourceFragment';
import { assert } from 'chai';

import MockClient from './MockClient';

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

  it('.getMutator()', function (done) {
    const mockClient = new MockClient();
    const fragment = ResourceFragment('test', {
      options: {
        client: mockClient.client.bind(mockClient),
      },
    });
    const mutator = fragment.getMutator({});
    mutator.create()
      .then(() => mutator.read())
      .then(() => {
        assert.deepEqual(mockClient.result, { url: '', method: 'GET', headers: {}, query: {} });
      })
      .then(() => mutator.update())
      .then(() => {
        assert.deepEqual(mockClient.result, { url: '', method: 'PUT', headers: {}, query: {} });
      })
      .then(() => mutator.del())
      .then(() => {
        assert.deepEqual(mockClient.result, { url: '', method: 'DELETE', headers: {}, query: {} });
      })
      .then(() => mutator.list())
      .then(() => {
        assert.deepEqual(mockClient.result, { url: '', method: 'GET', headers: {}, query: {} });
      })
      .then(() => {
        done();
      });

  });

});
