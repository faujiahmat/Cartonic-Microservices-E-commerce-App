import client from 'prom-client';
import { Request, Response } from 'express';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export function getMetrics(_req: Request, res: Response) {
  res.set('Content-Type', register.contentType);
  register.metrics().then((data) => res.send(data));
}
