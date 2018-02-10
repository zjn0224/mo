import React from 'react'
import {connect} from 'dva'
import {Select,  Card, Input,Icon,Button } from 'antd'
import {showTime} from '../../../utils/index'
import {dataCategory} from '../../../constants'
import {arrayToJson, JsonToArray} from '../../../utils/JsonUtils'
import {routerRedux} from 'dva/router'

import styles from './index.less'

const Option = Select.Option
const Search = Input.Search
const related_fields = ['All',
  'Business', 'Government', 'Education', 'Environment',
  'Health', 'Housing & Development', 'Public Services',
  'Social', 'Transportation', 'Science', 'Technology']


function AllRequest({history, allRequest, dispatch}) {

  function handleCategoryChange(value) {
    dispatch({
      type: 'publicServedModels/fetch',
      payload: {category: value, skipping: 0}
    })
  }


  function toUserRequestDetail(user_request) {
    dispatch(routerRedux.push('/userrequest/' + user_request._id))
  }

  function search(value) {
    dispatch({
      type: 'publicServedModels/search',
      payload: {searchStr: value},
    })
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.header}>
        <Search
          placeholder="search"
          style={{width: 200}}
          onSearch={value => search(value)}
        />
      </div>
      <div className={styles.requestList}>
      {allRequest.userRequest.map(e =>
        <Card key={e._id} title={e.title} className={styles.card}
              onClick={() => toUserRequestDetail(e, history)} style={{ cursor: 'pointer' }}>
          <div>
            <div>
             {e['user_id'] &&  <p><Icon type="user" />  {e.user_id}</p>}
             {e['tags'] &&  <p><Icon type="tag" />  {e.tags}</p>}
             {<p><Icon type="message" /> {e.comments_number}</p>}
              <Icon type="star" />
            </div>
            <div>
            <p><Icon type="clock-circle-o" /> {showTime(e.create_time)}</p>
            </div>
          </div>
        </Card>)}
      </div>
    </div>
  )
}

export default connect(({allRequest}) => ({allRequest}))(AllRequest)
