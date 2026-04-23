import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';
import createAuthenticationMiddleware from '../../middleware/authentication.js';

export default (container) => {
  const threadsHandler = new ThreadsHandler(container);
  const authenticationMiddleware = createAuthenticationMiddleware(container);

  return createThreadsRouter(threadsHandler, authenticationMiddleware);
};
