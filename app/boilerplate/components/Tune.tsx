import React, { ForwardedRef, forwardRef } from 'react';

import { tune } from '../../subtuneTypes/Tune';

import { CSS } from '@dnd-kit/utilities';

// (props: { tuneObj: tune; onClick: (arg0: { tune: tune; }) => void; })
export const Tune = (props: { tuneObj: tune; onClick: (arg0: { tune: tune; }) => void; })=> {
  const tune: tune = props.tuneObj;

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