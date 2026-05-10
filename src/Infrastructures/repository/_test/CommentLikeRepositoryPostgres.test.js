import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import CommentLikeRepositoryPostgres from '../CommentLikeRepositoryPostgres.js';

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentLike function', () => {
    it('should persist comment like', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-like-123', username: 'dicoding-like-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-like-123', owner: 'user-like-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-like-123',
        threadId: 'thread-like-123',
        owner: 'user-like-123',
      });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      await commentLikeRepositoryPostgres.addCommentLike('comment-like-123', 'user-like-123');

      const likes = await CommentLikesTableTestHelper.findLike('comment-like-123', 'user-like-123');
      expect(likes).toHaveLength(1);
    });

    it('should not throw error when persisting existing comment like', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-like-456', username: 'dicoding-like-2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-like-456', owner: 'user-like-456' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-like-456',
        threadId: 'thread-like-456',
        owner: 'user-like-456',
      });
      await CommentLikesTableTestHelper.addLike({
        commentId: 'comment-like-456',
        owner: 'user-like-456',
      });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      await expect(commentLikeRepositoryPostgres.addCommentLike('comment-like-456', 'user-like-456'))
        .resolves
        .not.toThrowError();
    });
  });

  describe('deleteCommentLike function', () => {
    it('should delete comment like', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-like-789', username: 'dicoding-like-3' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-like-789', owner: 'user-like-789' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-like-789',
        threadId: 'thread-like-789',
        owner: 'user-like-789',
      });
      await CommentLikesTableTestHelper.addLike({
        commentId: 'comment-like-789',
        owner: 'user-like-789',
      });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      await commentLikeRepositoryPostgres.deleteCommentLike('comment-like-789', 'user-like-789');

      const likes = await CommentLikesTableTestHelper.findLike('comment-like-789', 'user-like-789');
      expect(likes).toHaveLength(0);
    });
  });

  describe('isCommentLiked function', () => {
    it('should return true when comment is liked by owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-like-111', username: 'dicoding-like-4' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-like-111', owner: 'user-like-111' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-like-111',
        threadId: 'thread-like-111',
        owner: 'user-like-111',
      });
      await CommentLikesTableTestHelper.addLike({
        commentId: 'comment-like-111',
        owner: 'user-like-111',
      });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      const isCommentLiked = await commentLikeRepositoryPostgres.isCommentLiked('comment-like-111', 'user-like-111');

      expect(isCommentLiked).toEqual(true);
    });

    it('should return false when comment is not liked by owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-like-222', username: 'dicoding-like-5' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-like-222', owner: 'user-like-222' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-like-222',
        threadId: 'thread-like-222',
        owner: 'user-like-222',
      });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool);

      const isCommentLiked = await commentLikeRepositoryPostgres.isCommentLiked('comment-like-222', 'user-like-222');

      expect(isCommentLiked).toEqual(false);
    });
  });
});
