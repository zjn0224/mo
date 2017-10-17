import React from 'react'
import {
  Route,
  Link,
} from 'react-router-dom'
import { Button } from 'antd'
import Dots from './Dots'
import styles from './index.less'

const pageConfig =[
  {
    path: 'import',
    text: 'Import Data',
  },
  {
    path: 'analysis',
    text: 'Data Analysis',
  },
  {
    path: 'modelling',
    text: 'Modelling',
  },
  {
    path: 'deploy',
    text: 'Deployment',
  },

];
const paths = pageConfig.map(e => e.path)
const titles = pageConfig.map(e => e.text)
const num = 5
const radius = 5
const buttonSize = 30

function Steps({ match, history, location }) {
  console.log(match, location)
  // get active page name from url
  const [activePage] = location.pathname.split('/').slice(-1)
  const dis = radius*(num*2+1)
  return (
    <div>
      <div className={styles.steps} style={{margin: `10px ${dis}px`}}>
        {paths.map((p, i) =>
          <div className={styles.step} key={paths[i]}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                shape="circle"
                type={paths[i] === activePage ? 'primary' : 'default'}
                style={{ width: buttonSize, height: buttonSize }}
                onClick={() => history.push(`/projects/${match.params.projectID}/${paths[i]}`)}>
                {i + 1}
              </Button>
            </div>
            {i < paths.length - 1 && <Dots num={num} radius={radius}/>}
          </div>,
        )}
      </div>
      <div className='flex-row-center' style={{width: buttonSize*paths.length+dis*(paths.length*2)}} >
        {titles.map((p, i) =>
          <div key={titles[i]} style={{width: `${100/paths.length}%`, textAlign: 'center'}} >
            <p> {titles[i]}</p>
          </div>,
        )}
      </div>
    </div>
  )
}

export default Steps
