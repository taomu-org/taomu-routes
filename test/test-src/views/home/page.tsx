import React from 'react'

export interface TestPageProps extends PageProps {}

const Page: React.FC<TestPageProps> = ({ count }) => {
  return (
    <div>
      <p>component Page is created</p>
    </div>
  )
}

export default Page
