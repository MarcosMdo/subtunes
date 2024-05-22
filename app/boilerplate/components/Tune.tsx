import React, { ForwardedRef, forwardRef } from 'react';

import { Ttune } from '../../subtuneTypes/Tune';

import { CSS } from '@dnd-kit/utilities';

// (props: { tuneObj: tune; onClick: (arg0: { tune: tune; }) => void; })
export const Tune = (props: { tuneObj: Ttune; onClick: (arg0: { tune: Ttune; }) => void; })=> {
  const tune: Ttune = props.tuneObj;

  return (
    <div className='tune'>
        <li onClick={() => props.onClick({ tune })}>
            <p>{tune.name}</p>
            <p>{tune.artist}</p>
        </li>
    </div>
  );
}

export default Tune;