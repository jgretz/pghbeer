import {useCallback, useState} from 'react';
import {animateScroll} from 'react-scroll';

interface Props {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function Search({isVisible, setIsVisible, searchTerm, setSearchTerm}: Props) {
  const [inputText, setInputText] = useState(searchTerm);

  const handleTyping = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setInputText(event.currentTarget.value);
    },
    [setInputText],
  );

  const handleHide = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  const handleSearch = useCallback(() => {
    animateScroll.scrollToTop({
      delay: 0,
      duration: 0,
    });

    setSearchTerm(inputText);
    setIsVisible(false);
  }, [setSearchTerm, inputText, setIsVisible]);

  const handleClear = useCallback(() => {
    animateScroll.scrollToTop({
      delay: 0,
      duration: 0,
    });

    setSearchTerm('');
    setInputText('');

    setIsVisible(false);
  }, [setSearchTerm, setIsVisible]);

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleHide}
      ></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                    Search
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Enter a search term and the list will shrink to any brewery, beer, or style
                      that contains that text.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <input
                className="w-full border border-[#BE485C] p-1"
                onChange={handleTyping}
                value={inputText}
              />
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-[#BE485C] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                onClick={handleSearch}
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-[#BE485C] hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={handleHide}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
