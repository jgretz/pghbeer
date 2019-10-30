import {compose} from '@truefit/bach';
import {renderIf} from '@truefit/bach-recompose';

import {Checklist} from '../../checklist/components';
import Welcome from './welcome';

const isBotbList = () => {
  return window.location.hostname === 'list.beersoftheburgh.com';
};

export default compose(renderIf(isBotbList, Checklist))(Welcome);
