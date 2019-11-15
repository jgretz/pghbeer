import {configureHttp as configure} from '@truefit/http-utils';

export const configureHttp = () => {
  configure({
    baseConfig: {
      baseURL: process.env.API_BASE_URL,
    },
    baseHeaders: {
      auth_key:
        'ykE^WULrJczXdT*PDEgpSHqh0blfPR6pbzQG7q^t!3$4ic38tfJg4&9quqZI%cWA9oc1G&vrcXZBW6qMlxEBi^$Jf9X4drCL',
    },
  });
};
