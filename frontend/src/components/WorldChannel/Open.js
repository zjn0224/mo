import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'dva'
import {Tabs, Input, Icon} from 'antd'
import {WorldMessages, CloseWorldMessageItem} from './index'
import styles from './index.less'

class worldChannelC extends React.Component {

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.dispatch({
      type: "worldChannel/getWorldMessages",
      payload: {
        channel: "request"
      }
    })
  }

  render() {
    const {worldMessages, onClickIcon, isRight, dispatch, login} = this.props
    if (!login.user) {
      return (
        <div />
      )
    }
    else{
      return <Open worldMessages={worldMessages}
                   onClickIcon={onClickIcon}
                   dispatch={dispatch}
                   isRight={isRight}

      />
    }




    // return isRight ?
    //   <Open worldMessages={worldMessages} onClickIcon={onClickIcon}
    //         dispatch={dispatch}
    //   /> :
    //   <Close worldMessages={worldMessages} onClickIcon={onClickIcon}/>
  }
}


class Open extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    // this.props.dispatch({
    //   type: "worldChannel/getWorldMessages",
    //   payload: {
    //     channel: "request"
    //   }
    // })
    this.scrollToBottom()
  }

  componentDidUpdate() {
    console.log("componentDidUpdate")
    this.scrollToBottom()
  }

  scrollToBottom = () => {
    const messagesContainer = ReactDOM.findDOMNode(this.scrollView)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  handleSendMessage = (e) => {
    const inputMessage = e.target.value
    this.props.dispatch({
      type: "worldChannel/sendMessage",
      payload: {
        channel: "request",
        message: inputMessage
      }
    })
    e.target.value = ""
  }

  render() {
    const {worldMessages, onClickIcon, isRight} = this.props
    return (
      <div className={styles.container}
           style={{width: isRight ? 300 : 50}}
      >
        {
          isRight ?
            <div className={styles.first_row}>

              <Icon type="right" onClick={onClickIcon}
                    className={styles.icon_container}
              />

              <div className={styles.title}>
                ALL
              </div>

              <Icon type="question"
                    className={styles.icon_container}
              />
            </div> :

            <div className={styles.first_row}>
              <Icon type="left" onClick={onClickIcon}
                    className={styles.icon_container}
              />
            </div>
        }


        {/*<div className={styles.black_line}/>*/}

        <WorldMessages
          worldMessages={worldMessages}
          ref1={(el) => {
            this.scrollView = el
          }}
          isRight={isRight}
        />
        {
          isRight &&
          <div className={styles.input}>
            <Input
              placeholder="输入"
              onPressEnter={this.handleSendMessage}
            />

            <img
              style={{
                height: 20, width: 20,
                marginLeft: 10,
                marginRight: 10,
                display: "flex",
                justifyContent: "center",
                alignItem: "center"
              }}
              src={require('../../img/icon/aircraft.png')}
              // onClick={this.handleSendMessage}
            />

          </div>
        }

      </div>

    )
  }
}

// const Close = ({onClickIcon, worldMessages}) => {
//   return (
//     <div className={styles.close_container}>
//       <div className={styles.first_row}>
//         <Icon type="left" onClick={onClickIcon} style={{fontSize: 20}}/>
//         {/*<div className={styles.title}>*/}
//         {/*ALL*/}
//         {/*</div>*/}
//       </div>
//       <div className={styles.messages_container}>
//
//         {worldMessages.map((worldMessage) => {
//
//           return <CloseWorldMessageItem key={worldMessage._id} worldMessage={worldMessage}/>
//         })}
//       </div>
//     </div>
//   )
// }

export default connect(({login, worldChannel}) => ({login, ...worldChannel}))(worldChannelC)
