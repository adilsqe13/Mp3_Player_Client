import React from 'react';
import spinner from './spinner.gif';

export default function Spinner(props) {
  return (
      <div className='text-center'>
          <img height={props.height} width={props.width} src={spinner} alt="" />
      </div>
    
  )
}
