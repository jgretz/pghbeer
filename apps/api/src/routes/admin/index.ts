import {Hono} from 'hono';
import {authMiddleware} from '../../middleware/auth';
import {env} from '../../index';
import {breweryRoutes} from './breweries';
import {styleRoutes} from './styles';
import {beerRoutes} from './beers';
import {eventRoutes} from './events';
import {eventBeerRoutes} from './event-beers';

export const adminRoutes = new Hono();

const auth = authMiddleware(() => env.API_KEY);

adminRoutes.use('/*', auth);

adminRoutes.route('/breweries', breweryRoutes);
adminRoutes.route('/styles', styleRoutes);
adminRoutes.route('/beers', beerRoutes);
adminRoutes.route('/events', eventRoutes);
adminRoutes.route('/events', eventBeerRoutes);
