import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App, { Search, Button, Table, Loading, Sort } from './App';

Enzyme.configure({ adapter: new Adapter() });

describe('App', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(<App />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});

describe('Search', () => {

  const props = {
    value: '',
    onChange() { },
    onSubmit() { }
  }

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search {...props}>Search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(<Search {...props}>Search</Search>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })

});

describe('Button', () => {

  const props = {
    onClick(wrapper) {
      wrapper.setProps({ className: 'clicked' })
    },
    className: 'test-btn'
  }

  it('works well with props', () => {
    const element = shallow(<Button {...props}>Test Button</Button>);
    expect(element.find('.test-btn').length).toBe(1);
    element.simulate('click', element);
    expect(element.find('.clicked').length).toBe(1);
    expect(element.contains('Test Button')).toBe(true);
  })

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button {...props}>Give Me More</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button  {...props}>Give Me More</Button>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});

describe('Table', () => {
  const props = {
    list: [
      { title: '1', author: '1', nums_comments: 1, points: 2, objectID: 'y' },
      { title: '2', author: '2', nums_comments: 1, points: 2, objectID: 'z' }
    ],
    onDismiss() { },
    sortKey: 'TITLE',
    onSort() {},
    isSortReverse: false
  }

  it('shows two items in list', () => {
    const element = shallow(<Table {...props} />);
    expect(element.find('.table-row').length).toBe(2);
  })

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Table {...props} />, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table { ...props } />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});

describe('Loading', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Loading />, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('hava a valid snapshot', () => {
    const component = renderer.create(<Loading />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
});

describe('Sort', () => {
  const props = {
    sortKey: 'TITLE',
    onSort() { },
    activeSortKey: 'TITLE',
    children: 'title'
  }

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Sort {...props} />, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('hava a valid snapshot', () => {
    const component = renderer.create(<Sort {...props} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
});


