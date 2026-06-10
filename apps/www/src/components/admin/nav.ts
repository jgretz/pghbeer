// Single source of truth for the admin left rail.
// Entity tasks must NOT edit this array — their routes 404 until their task
// lands. Adding a route file is enough; the nav entry already exists here.

export type NavItem = {
  label: string;
  to: string;
  exact?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {label: 'Dashboard', to: '/admin', exact: true},
  {label: 'Breweries', to: '/admin/breweries'},
  {label: 'Styles', to: '/admin/styles'},
  {label: 'Beers', to: '/admin/beers'},
  {label: 'Events', to: '/admin/events'},
  {label: 'Map', to: '/admin/map'},
];
