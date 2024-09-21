import React from 'react'

import { routeTools, Link } from '../../../../lib'

export interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <p>component Home is created</p>

      <div>
        <button
          onClick={() => {
            routeTools.navigateToByRouteName('page1', { params: { count: 1 } })
          }}
        >
          page1
        </button>
        <button
          onClick={() => {
            routeTools.navigateToByRouteName('page2', { params: { count: 2 } })
          }}
        >
          page2
        </button>
      </div>

      <div>
        <Link to="/page1" params={{ count: 1 }}>
          page1
        </Link>
        <Link to="/page2" params={{ count: 2 }}>
          page2
        </Link>
      </div>
    </div>
  )
}

export default Home
