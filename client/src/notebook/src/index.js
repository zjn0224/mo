import React from 'react';
import Nteract from './nteract/';
import Jupyter from './jupyter/';
import Provider from './util/provider';

import createStoreRx from './store';
import {
  setNotebook,
  setExecutionState,
  createCellAfter,
  updateCellSource,
  executeCell
} from './actions';
import { reducers } from './reducers';
import Rx from 'rxjs';

export function createStore(state) {
  const { store, dispatch } = createStoreRx(state || {
    filename: 'test',
    executionState: 'not connected',
    notebook: null,
  }, reducers);

  store
  .pluck('channels')
  .distinctUntilChanged()
  .switchMap(channels => {
    if (!channels || !channels.iopub) {
      return Rx.Observable.of('not connected');
    }
    return channels
    .iopub
    .ofMessageType('status')
    .pluck('content', 'execution_state');
  })
  .subscribe(st => {
    dispatch(setExecutionState(st));
  });

  return {
    store,
    dispatch,
  };
}

export class Notebook extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.store && this.props.dispatch) {
      this.store = this.props.store;
      this.dispatch = this.props.dispatch;
    } else {
      const { store, dispatch } = createStore({
        filename: 'test',
        executionState: 'not connected',
        notebook: null,
        result: ''
      });

      this.store = store;
      this.dispatch = dispatch;
    }

    this.state = {
      channels: this.props.channels,
      forceSource: ''
    };

    this.store.subscribe(state => this.setState(state));

  }
  componentDidMount() {
    if (this.props.content) {
      this.dispatch(setNotebook(this.props.content));
    }
  }

  componentWillReceiveProps(nextProps) {
    //console.log("nextProps", nextProps.forceSource);
    this.setState({
      forceSource: nextProps.forceSource
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // let t = this.store.getState();
    // console.log('state', this.state.results, prevState.results)
    // console.log(prevState.notebook, this.state.notebook);
    if(prevState.notebook === undefined){
      let source = `# this is the id of the project you are editting \n` +
        `project_id = "${this.props.project_id}" \n` +
        `dataset_id = "${this.props.dataset_id}" \n` +
        `dataset_name = "${this.props.dataset_name}" \n` +
        "# you might need to use it some where in your code\n" +
        "# to run MNIST, you need to specify your training steps after \n# getting the code \n" +
        "# you also need to specify the traning data set id as listed above";
      const cellOrder = this.state.notebook.get('cellOrder');
      let id = cellOrder.get(0, null);
      this.dispatch(updateCellSource(id, source));
      this.dispatch(executeCell(this.props.channels,
        id,
        source));
      this.dispatch(createCellAfter('code', id));
    }

    if (this.state.results !== prevState.results) {
      this.props.result(this.state.results);
    }
  }

  render() {
    const dispatch = this.dispatch;
    const store = this.store;

    return (
      <Provider rx={{ dispatch, store }}  store="">
        <div >
          {
            this.state.err &&
            <pre>{this.state.err.toString()}</pre>
          }
          {
            this.state.notebook &&
            <Nteract
              notebook={this.state.notebook}
              channels={this.state.channels}
              forceSource={this.state.forceSource}
            />
          }
        </div>
      </Provider>
    );
  }
}

Notebook.propTypes = {
  content: React.PropTypes.object,
  store: React.PropTypes.object,
  ui: React.PropTypes.string,
  dispatch: React.PropTypes.func,
  channels: React.PropTypes.object,
  forceSource: React.PropTypes.string,
  result: React.PropTypes.func,
};

export default Notebook;