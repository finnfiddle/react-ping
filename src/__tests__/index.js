/* eslint-disable prefer-arrow-callback */
// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import MockClient from './MockClient';
import { createContainer } from '../index';

class BlankComponent extends Component {
  state = { test: 'foo' }
  render() { return null; }
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
        url: ({ props, state }) => `/test/url/${props.foo}/${state.test}`,
        headers: ({ props, state }) => ({ foo: 'bar', baz: props.foo, stateHeader: state.test }),
        query: ({ props, state }) => ({ foo: 'bar', baz: props.foo, stateParam: state.test }),
        method: ({ props, state }) =>
          (props.foo === 'foo' && state.test === 'foo') ? 'POST' : 'GET',
        options: () => ({ client: mockClient.client.bind(mockClient) }),
      },
    }, BlankComponent);

    const wrapper = mount(<TestComponent foo='foo' />);

    assert.deepEqual(mockClient.result, {
      url: '/test/url/foo/foo',
      method: 'POST',
      headers: { foo: 'bar', baz: 'foo', stateHeader: 'foo' },
      query: { foo: 'bar', baz: 'foo', stateParam: 'foo' },
    });

    assert.deepEqual(wrapper.state(), {
      test: { response: 'foobarbaz' },
    });
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
