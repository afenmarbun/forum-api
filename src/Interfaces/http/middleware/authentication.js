import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

const createAuthenticationMiddleware = (container) => async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AuthenticationError('Missing authentication');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AuthenticationError('Invalid authentication');
    }

    const authenticationTokenManager = container.getInstance(AuthenticationTokenManager.name);
    const credentials = await authenticationTokenManager.verifyAccessToken(token);

    req.auth = { credentials };
    next();
  } catch (error) {
    next(error);
  }
};

export default createAuthenticationMiddleware;
