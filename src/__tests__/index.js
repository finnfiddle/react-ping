/* eslint-disable prefer-arrow-callback, react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import MockClient from './MockClient';
import { createContainer, createResource } from '../index';

class BlankComponent extends Component {
  state = { test: 'foo' }
  render() {
    return (
      <div>
        <a onClick={this.handleTriggerPing.bind(this, 'list')} className='list' />
        <a onClick={this.handleTriggerPing.bind(this, 'create')} className='create' />
        <a onClick={this.handleTriggerPing.bind(this, 'read')} className='read' />
        <a onClick={this.handleTriggerPing.bind(this, 'update')} className='update' />
        <a onClick={this.handleTriggerPing.bind(this, 'del')} className='del' />
      </div>
    );
  }
  handleTriggerPing(verb) {
    this.props.ping.test[verb]({ id: 'foo' });
  }
}

describe('createContainer', function () {

  this.timeout(10000);

  it('fragment defaults', function () {
    const mockClient = new MockClient();
    const TestComponent = createContainer({
      test: {
        options: () => ({ client: mockClient.client.bind(mockClient) }),
      },
    }, BlankComponent);

    mount(<TestComponent foo='foo' />);

    assert.deepEqual(mockClient.result, { url: '', method: 'GET', headers: {}, query: {} });
  });

  it('fragment kitchensink', function () {
    const mockClient = new MockClient();
    const TestComponent = createContainer({
      test: {
        url: ({ props, state }) => `/list/url/${props.foo}/${state.test}`,
        headers: ({ props, state }) => ({ static: 'bar', prop: props.foo, state: state.test }),
        query: ({ props, state }) => ({ static: 'bar', prop: props.foo, state: state.test }),
        method: ({ props, state }) =>
          (props.foo === 'foo' && state.test === 'foo') ? 'POST' : 'GET',
        options: () => ({ client: mockClient.client.bind(mockClient) }),
      },
    }, BlankComponent);

    const wrapper = mount(<TestComponent foo='foo' />);

    assert.deepEqual(mockClient.result, {
      url: '/list/url/foo/foo',
      method: 'POST',
      headers: { static: 'bar', prop: 'foo', state: 'foo' },
      query: { static: 'bar', prop: 'foo', state: 'foo' },
    });

    assert.deepEqual(wrapper.state(), {
      test: [{ id: 'list' }],
    });
  });

  it('resource fragment', function () {
    const mockClient = new MockClient();
    const TestComponent = createContainer({
      test: createResource({
        list: {
          url: ({ props, state, id }) =>
            `/list/${props.foo}/${state.test}/${id}`,
          headers: ({ props, state, id }) =>
            ({ static: 'list', prop: props.foo, state: state.test, custom: id }),
          query: ({ props, state, id }) =>
            ({ static: 'list', prop: props.foo, state: state.test, custom: id }),
          method: ({ props, state, id }) =>
            (props.foo === 'foo' && state.test === 'foo' && id === 'foo') ? 'list' : 'GET',
        },
        create: {
          url: ({ props, state, id }) =>
            `/create/${props.foo}/${state.test}/${id}`,
          headers: ({ props, state, id }) =>
            ({ static: 'create', prop: props.foo, state: state.test, custom: id }),
          query: ({ props, state, id }) =>
            ({ static: 'create', prop: props.foo, state: state.test, custom: id }),
          method: ({ props, state, id }) =>
            (props.foo === 'foo' && state.test === 'foo' && id === 'foo') ?
              'create' :
              'GET',
        },
        read: {
          url: ({ props, state, id }) =>
            `/read/${props.foo}/${state.test}/${id}`,
          headers: ({ props, state, id }) =>
            ({ static: 'read', prop: props.foo, state: state.test, custom: id }),
          query: ({ props, state, id }) =>
            ({ static: 'read', prop: props.foo, state: state.test, custom: id }),
          method: ({ props, state, id }) =>
            (props.foo === 'foo' && state.test === 'foo' && id === 'foo') ?
              'read' :
              'GET',
        },
        update: {
          url: ({ props, state, id }) =>
            `/update/${props.foo}/${state.test}/${id}`,
          headers: ({ props, state, id }) =>
            ({ static: 'update', prop: props.foo, state: state.test, custom: id }),
          query: ({ props, state, id }) =>
            ({ static: 'update', prop: props.foo, state: state.test, custom: id }),
          method: ({ props, state, id }) =>
            (props.foo === 'foo' && state.test === 'foo' && id === 'foo') ?
              'update' :
              'GET',
        },
        del: {
          url: ({ props, state, id }) =>
            `/del/${props.foo}/${state.test}/${id}`,
          headers: ({ props, state, id }) =>
            ({ static: 'del', prop: props.foo, state: state.test, custom: id }),
          query: ({ props, state, id }) =>
            ({ static: 'del', prop: props.foo, state: state.test, custom: id }),
          method: ({ props, state, id }) =>
            (props.foo === 'foo' && state.test === 'foo' && id === 'foo') ?
              'del' :
              'GET',
        },
        options: { client: mockClient.client.bind(mockClient) },
      }),
    }, BlankComponent);

    const wrapper = mount(<TestComponent foo='foo' />);

    assert.deepEqual(
      mockClient.result,
      {
        url: '/list/foo/foo/undefined',
        method: 'GET',
        headers: { static: 'list', prop: 'foo', state: 'foo', custom: undefined },
        query: { static: 'list', prop: 'foo', state: 'foo', custom: undefined },
      }
    );

    wrapper.find('.list').simulate('click');

    assert.deepEqual(
      mockClient.result,
      {
        url: '/list/foo/foo/foo',
        method: 'list',
        headers: { static: 'list', prop: 'foo', state: 'foo', custom: 'foo' },
        query: { static: 'list', prop: 'foo', state: 'foo', custom: 'foo' },
      }
    );

    wrapper.find('.create').simulate('click');

    assert.deepEqual(
      mockClient.result,
      {
        url: '/create/foo/foo/foo',
        method: 'create',
        headers: { static: 'create', prop: 'foo', state: 'foo', custom: 'foo' },
        query: { static: 'create', prop: 'foo', state: 'foo', custom: 'foo' },
      }
    );

    wrapper.find('.read').simulate('click');

    assert.deepEqual(
      mockClient.result,
      {
        url: '/read/foo/foo/foo',
        method: 'read',
        headers: { static: 'read', prop: 'foo', state: 'foo', custom: 'foo' },
        query: { static: 'read', prop: 'foo', state: 'foo', custom: 'foo' },
      }
    );
    wrapper.find('.update').simulate('click');

    assert.deepEqual(
      mockClient.result,
      {
        url: '/update/foo/foo/foo',
        method: 'update',
        headers: { static: 'update', prop: 'foo', state: 'foo', custom: 'foo' },
        query: { static: 'update', prop: 'foo', state: 'foo', custom: 'foo' },
      }
    );

    wrapper.find('.del').simulate('click');

    assert.deepEqual(
      mockClient.result,
      {
        url: '/list/foo/foo/foo',
        method: 'list',
        headers: { static: 'list', prop: 'foo', state: 'foo', custom: 'foo' },
        query: { static: 'list', prop: 'foo', state: 'foo', custom: 'foo' },
      }
    );
  });

});

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// Shallow Rendering
// https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md
// describe('Shallow Rendering', () => {

  // it('to have three `.icon-test`s', () => {
  //   const wrapper = shallow(<DeferredInput />);
  //   expect(wrapper.find('.icon-test')).to.have.length(3);
  // });
  //
  // it('simulates click events', () => {
  //   const buttonClick = sinon.spy();
  //   const wrapper = shallow(
  //         <DeferredInput handleClick={buttonClick} />
  //       );
  //   wrapper.find('button').simulate('click');
  //   expect(buttonClick.calledOnce).to.equal(true);
  // });

// });

// Full DOM Rendering
// https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md
// describe('Full DOM Rendering', () => {
//
//   it('allows us to set props', () => {
//     const wrapper = mount(<DeferredInput bar='baz' />);
//     expect(wrapper.props().bar).to.equal('baz');
//     wrapper.setProps({ bar: 'foo' });
//     expect(wrapper.props().bar).to.equal('foo');
//   });
//
//   it('calls componentDidMount', () => {
//     sinon.spy(DeferredInput.prototype, 'componentDidMount');
//     const wrapper = mount(<DeferredInput />);
//     expect(DeferredInput.prototype.componentDidMount.calledOnce).to.be.true;
//     DeferredInput.prototype.componentDidMount.restore();
//   });
//
// });

// Static Rendered Markup
// https://github.com/airbnb/enzyme/blob/master/docs/api/render.md
// describe('Static Rendered Markup', () => {

  // it('renders three `.icon-test`s', () => {
  //   const wrapper = render(<DeferredInput />);
  //   expect(wrapper.find('.icon-test').length).to.equal(3);
  // });

// });
