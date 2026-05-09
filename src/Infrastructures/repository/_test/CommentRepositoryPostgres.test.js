import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-123', username: 'dicoding-comment-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-123', owner: 'user-comment-123' });
      const newComment = new NewComment({
        content: 'sebuah komentar',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment('thread-comment-123', 'user-comment-123', newComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-456', username: 'dicoding-comment-2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-456', owner: 'user-comment-456' });
      const newComment = new NewComment({
        content: 'sebuah komentar',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment('thread-comment-456', 'user-comment-456', newComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-comment-456',
      }));
    });
  });

  describe('verifyCommentExists function', () => {
    it('should throw NotFoundError when comment not found on thread', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExists('thread-123', 'comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exists on thread', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-123', username: 'dicoding-comment-3' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-123', owner: 'user-comment-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-comment-123',
        threadId: 'thread-comment-123',
        owner: 'user-comment-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExists('thread-comment-123', 'comment-comment-123'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-123', username: 'dicoding-comment-4' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-123', owner: 'user-comment-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-comment-123',
        threadId: 'thread-comment-123',
        owner: 'user-comment-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-comment-123', 'user-999'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-123', username: 'dicoding-comment-5' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-123', owner: 'user-comment-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-comment-123',
        threadId: 'thread-comment-123',
        owner: 'user-comment-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-comment-123', 'user-comment-123'))
        .resolves
        .not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-123', username: 'dicoding-comment-6' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-123', owner: 'user-comment-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-comment-123',
        threadId: 'thread-comment-123',
        owner: 'user-comment-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment('comment-comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-comment-123');
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments by thread id correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-comment-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-123', owner: 'user-comment-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-comment-123',
        threadId: 'thread-comment-123',
        owner: 'user-comment-456',
        content: 'komentar pertama',
        date: '2021-08-08T07:22:33.555Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-comment-456',
        threadId: 'thread-comment-123',
        owner: 'user-comment-123',
        content: 'komentar kedua',
        date: '2021-08-08T07:26:21.338Z',
        isDelete: true,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-comment-123');

      expect(comments).toEqual([
        {
          id: 'comment-comment-123',
          username: 'johndoe',
          date: new Date('2021-08-08T07:22:33.555Z'),
          content: 'komentar pertama',
          isDelete: false,
          likeCount: 0,
        },
        {
          id: 'comment-comment-456',
          username: 'dicoding',
          date: new Date('2021-08-08T07:26:21.338Z'),
          content: 'komentar kedua',
          isDelete: true,
          likeCount: 0,
        },
      ]);
    });
  });
});
