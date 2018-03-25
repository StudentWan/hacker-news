import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import fontawesome from '@fortawesome/fontawesome';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner';
import './App.css';

fontawesome.library.add(faSpinner);

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '30';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false
    };

    // 原理是对原型链变量屏蔽
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    this.setState(prevState => {
      const { searchKey, results } = prevState;
      const oldHits = results && results[searchKey]
        ? results[searchKey].hits
        : [];
      const updatedHits = [...oldHits, ...hits];

      return {
        results: {
          ...results,
          [searchKey]: {hits: updatedHits, page}
        },
        isLoading: false
      }
    });
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true })
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => {
        if (this._isMounted) {
          this.setSearchTopStories(result)
        }
      })
      .catch(e => this.setState({ error: e }));
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    })
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  componentWillMount() {
    this._isMounted = true;
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { searchTerm, results, searchKey, error, isLoading } = this.state;

    const page = (results && results[searchKey] && results[searchKey].page) || 0;

    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        {
          error
            ? (
              <div className="interactions">
                <p>Some thing went wrong.</p>
              </div>
            )
            : (
              <Table
                list={list}
                onDismiss={this.onDismiss} />
            )
        }
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const { value, onChange, onSubmit, children } = this.props;

    return (
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={value}
          onChange={onChange}
          ref={node => this.input = node} />
        <button type="submit">
          {children}
        </button>
      </form>
    );
  }
}

Search.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node
};

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const {list, onDismiss} = this.props;
    const {sortKey, isSortReverse} = this.state;

    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
    return (
      <div className="table">
        <div className="table-header">
          <span>
            <Sort
              sortKey="TITLE"
              onSort={this.onSort}
              activeSortKey={sortKey}>Title</Sort>
          </span>
          <span>
            <Sort
              sortKey="AUTHOR"
              onSort={this.onSort}
              activeSortKey={sortKey}>Author</Sort>
          </span>
          <span>
            <Sort
              sortKey="COMMENTS"
              onSort={this.onSort}
              activeSortKey={sortKey}>Comments</Sort>
          </span>
          <span>
            <Sort
              sortKey="POINTS"
              onSort={this.onSort}
              activeSortKey={sortKey}>Points</Sort>
          </span>
        </div>
        {
          reverseSortedList.map(item => (
            <div key={item.objectID} className="table-row">
              <span style={{ width: '40%' }}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={{ width: '30%' }}>{item.author}</span>
              <span style={{ width: '10%' }}>{item.num_comments}</span>
              <span style={{ width: '10%' }}>{item.points}</span>
              <span style={{ width: '10%' }}>
                <Button onClick={() => onDismiss(item.objectID)} className="button-inline">Dissmiss</Button>
              </span>
            </div>
          ))
        }
      </div>
    );
  }
}

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.num_comments
    })).isRequired,
  onDismiss: PropTypes.func.isRequired
}

const Button = ({ onClick, className, children }) =>
  (
    <button
      onClick={onClick}
      className={className}
      type="button" >
      {children}
    </button>
  );

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

Button.defaultProps = {
  className: ''
};

const Loading = () => (
  <FontAwesomeIcon icon={faSpinner} spin />
);

const withLoading = (Component) => ({ isLoading, ...rest }) => {
  return (
    isLoading
      ? <Loading />
      : <Component {...rest} />
  );
}

const Sort = ({ sortKey, onSort, activeSortKey, children }) => {
  const sortClass = sortKey === activeSortKey ? 'button-active' : '';

  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass}>{children}</Button>
  );
};

Sort.propTypes = {
  sortKey: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  activeSortKey: PropTypes.string.isRequired,
  children: PropTypes.node
}

const ButtonWithLoading = withLoading(Button);

export default App;

export {
  Button,
  Search,
  Table,
  Loading,
  Sort
};

