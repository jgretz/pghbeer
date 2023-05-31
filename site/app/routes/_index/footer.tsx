import search from '../../images/search.png';
import hash from '../../images/hashtag.png';
import {useCallback} from 'react';

interface Props {
  showSearch: (isVisible: boolean) => void;
  showJump: (isVisible: boolean) => void;
}

export default function Footer({showSearch, showJump}: Props) {
  const handleShowSearch = useCallback(() => {
    showSearch(true);
  }, [showSearch]);

  const handleShowJump = useCallback(() => {
    showJump(true);
  }, [showJump]);

  return (
    <>
      <div className="h-10"></div>
      <div className="container fixed bottom-0 left-0 right-0 m-auto flex h-10 w-full max-w-lg flex-row justify-between bg-black text-white">
        <div className="ml-1 flex items-center" onClick={handleShowJump}>
          <img src={hash} alt="jump icon" />
        </div>
        <div className="mr-1 flex items-center" onClick={handleShowSearch}>
          <img src={search} alt="search icon" />
        </div>
      </div>
    </>
  );
}
