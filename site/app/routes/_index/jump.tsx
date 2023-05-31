import {useCallback} from 'react';
import {scroller} from 'react-scroll';

interface Props {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;

  names: string[];
}

export function Jump({isVisible, setIsVisible, names}: Props) {
  const handleHide = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  const handleJump = useCallback(
    (name: string) => () => {
      setIsVisible(false);

      scroller.scrollTo(name, {
        duration: 1200,
        delay: 100,
        smooth: true,
        offset: -90,
      });
    },
    [setIsVisible],
  );

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleHide}
      ></div>

      <div className="fixed inset-0 z-10 overflow-y-auto" onClick={handleHide}>
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                    Quick Jump
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Jump to the breweries that start with ...
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center px-4 py-3">
              {names.map((name) => (
                <div
                  key={name}
                  className="m-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#BE485C] text-white"
                  onClick={handleJump(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
