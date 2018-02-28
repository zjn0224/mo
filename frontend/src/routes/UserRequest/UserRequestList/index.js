import React from 'react'
import {connect} from 'dva'
import {Select, Card, Input, Icon, Button, Row, Col, Pagination } from 'antd'
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
      type: 'allRequest/search',
      payload: {searchStr: value},
    })
  }

  function onShowSizeChange(current, pageSize) {
    dispatch({
      type: 'allRequest/changePageNoSize',
      payload: {pageNo:current,
                pageSize:pageSize},
    })
    dispatch({
      type: 'allRequest/fetchAllRequest',
      payload: {},
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
        {JsonToArray(allRequest.userRequestDic).map(e =>
          <Card key={e._id} className={styles.card}>
            {/*style={{cursor: 'pointer'}}*/}
            <div>
              <Row>
                <Col span={3}>
                  <div onClick={() => toUserRequestDetail(e, history)}>
                    <div className={styles.starDiv}>
                      <p
                        className={styles.starNumber}>{e['star_user'].length}</p>
                      <p className={styles.starText}>Star</p>
                    </div>
                    <div className={styles.starDiv}>
                      <p className={styles.starNumber}>{e['answer_number']}</p>
                      <p className={styles.starText}>Answer</p>
                    </div>
                  </div>
                </Col>
                <Col span={21}>
                  <div>
                    <p className={styles.title}
                       onClick={() => toUserRequestDetail(e, history)}>{e.title}</p>
                    {/*<p className={styles.description}>{e.description}</p>*/}
                    <div>
                      {e['tags'].length>0 && e['tags'].map(e =><p key={e} className={styles.tags}>{e}</p>)}
                      <div className={styles.timeAndUserDiv}>
                        <p className={styles.showTime}>{showTime(e.create_time)}</p>
                        <p className={styles.showTime}>&nbsp;&nbsp; asked at &nbsp;&nbsp;</p>
                        <p className={styles.showTime}>{e.user_ID} </p>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              {/*<Row>*/}
              {/*{e['user_id'] && <p><Icon type="user"/> {e.user_id}</p>}*/}
              {/*{e['tags'] && <p><Icon type="tag"/> {e.tags}</p>}*/}
              {/*<Button icon="caret-up">&emsp;{e['votes_up_user'].length}</Button>&emsp;&emsp;*/}
              {/*<Button icon="star">收藏</Button>&emsp;&emsp;*/}
              {/*<Icon type="clock-circle-o"/> {showTime(e.create_time)}*/}
              {/*</Row>*/}
            </div>
          </Card>)}
      </div>
      <div className={styles.pagination}>
        <Pagination showSizeChanger onShowSizeChange={onShowSizeChange}
                    onChange={onShowSizeChange}
                    defaultCurrent={1} total={allRequest.totalNumber} />
      </div>
    </div>
  )
}

export default connect(({allRequest}) => ({allRequest}))(AllRequest)
