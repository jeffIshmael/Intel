import React from 'react';
import Transfer from "../components/Transfer";

const Page = () => {
  return (
    <div>
        <Transfer amount={0.02} address={"0xa877f80EB1A5d01fC99096Bab9364c3f0FAFCA0D"} />
    </div>
  )
}

export default Page