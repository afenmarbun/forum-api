import express from 'express';

const createThreadsRouter = (handler, authentication) => {
  const router = express.Router();

  router.get('/:threadId', handler.getThreadDetailHandler);

  router.post('/', authentication, handler.postThreadHandler);
  router.post('/:threadId/comments', authentication, handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authentication, handler.deleteCommentHandler);
  router.post('/:threadId/comments/:commentId/replies', authentication, handler.postReplyHandler);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', authentication, handler.deleteReplyHandler);

  return router;
};

export default createThreadsRouter;
