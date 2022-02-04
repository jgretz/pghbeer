import {v4} from 'uuid';

const WEBUSERID = 'WEBUSERID';

export default (): string => {
  let webuserid = localStorage.getItem(WEBUSERID);
  if (!webuserid) {
    webuserid = v4();
    localStorage.setItem(WEBUSERID, webuserid);
  }

  return webuserid;
};
