import {Fragment, useCallback, useState} from 'react';
import type {StatsCountListItem} from '~/Types';

interface Props {
  title: string;
  data: StatsCountListItem[];
}

export function StatsList({title, data}: Props) {
  const [collapsed, setCollapsed] = useState(true);

  const handleClick = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  return (
    <div>
      <h1 className="mt-5 text-3xl" onClick={handleClick}>
        {title}
      </h1>
      <div className={`ml-5 mr-12 grid grid-cols-3 ${collapsed ? 'hidden' : 'visible'}`}>
        {data.map(function (stat) {
          return (
            <Fragment key={stat.name}>
              <div className="col-span-2 line-clamp-1">{stat.name}:</div>
              <div className="text-right">{stat.count}</div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
