import {Injectable} from '@nestjs/common';
import {AUTH_CONFIG} from '../constants';

export const enforceKeyMiddleware = (req, res, next) => {
  if (req.method === 'GET' || req.headers.auth_key === AUTH_CONFIG.key) {
    next();
    return;
  }

  res.status(403).send();
};
