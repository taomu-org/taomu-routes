import React from 'react'

import {} from '../../../../lib'

export interface TestPageProps extends PageProps {}

const Page: React.FC<TestPageProps> = ({ count }) => {
  return (
    <div>
      <p>component Page is created {count}</p>
    </div>
  )
}

export default Page
