import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { orm } from '../../app';

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  RequestContext.create(orm.em, next);
}