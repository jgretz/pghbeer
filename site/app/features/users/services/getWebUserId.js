import uuid from 'uuid';

const WEBUSERID = 'WEBUSERID';

export default () => {
  let webuserid = localStorage.getItem(WEBUSERID);
  if (!webuserid) {
    webuserid = uuid();
    localStorage.setItem(WEBUSERID, webuserid);
  }

  return webuserid;
};
