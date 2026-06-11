// SERVER-ONLY module. Runs inside createServerFn so the admin API key (read via
// adminFetch / process.env) stays server-side and is never bundled to the client.

import {createServerFn} from '@tanstack/react-start';
import {adminFetch} from './server-fn';

// Stamps a new data version so attendee phones refetch the beer list + map on
// their next page load.
export const bustCache = createServerFn({method: 'POST'})
  .validator((input: {eventId: number}) => input)
  .handler(
    async ({data}): Promise<{version: string}> =>
      (
        await adminFetch('/admin/cache/bust', {
          method: 'POST',
          body: JSON.stringify({eventId: data.eventId}),
        })
      ).json(),
  );
