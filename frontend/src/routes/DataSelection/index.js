import React from 'react'
import MySelection from './MySelection'


class DataSelection extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props,
    }
  }
  render() {
    return (
      <div>
      <MySelection {...this.props} isStaged={false}/>
      </div>
    )
  }
}

export default DataSelection;
