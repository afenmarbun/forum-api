import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-reply-123', username: 'dicoding-reply-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply-123', owner: 'user-reply-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-123',
        threadId: 'thread-reply-123',
        owner: 'user-reply-123',
      });
      const newReply = new NewReply({
        content: 'sebuah balasan',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply('comment-reply-123', 'user-reply-123', newReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-reply-456', username: 'dicoding-reply-2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply-456', owner: 'user-reply-456' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-456',
        threadId: 'thread-reply-456',
        owner: 'user-reply-456',
      });
      const newReply = new NewReply({
        content: 'sebuah balasan',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepositoryPostgres.addReply('comment-reply-456', 'user-reply-456', newReply);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-reply-456',
      }));
    });
  });

  describe('verifyReplyExists function', () => {
    it('should throw NotFoundError when reply not found on comment', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyExists('comment-123', 'reply-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply exists on comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-reply-123', username: 'dicoding-reply-3' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply-123', owner: 'user-reply-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-123',
        threadId: 'thread-reply-123',
        owner: 'user-reply-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-reply-123',
        commentId: 'comment-reply-123',
        owner: 'user-reply-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyExists('comment-reply-123', 'reply-reply-123'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-reply-123', username: 'dicoding-reply-4' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply-123', owner: 'user-reply-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-123',
        threadId: 'thread-reply-123',
        owner: 'user-reply-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-reply-123',
        commentId: 'comment-reply-123',
        owner: 'user-reply-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-reply-123', 'user-999'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-reply-123', username: 'dicoding-reply-5' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply-123', owner: 'user-reply-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-123',
        threadId: 'thread-reply-123',
        owner: 'user-reply-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-reply-123',
        commentId: 'comment-reply-123',
        owner: 'user-reply-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-reply-123', 'user-reply-123'))
        .resolves
        .not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-reply-123', username: 'dicoding-reply-6' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply-123', owner: 'user-reply-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-123',
        threadId: 'thread-reply-123',
        owner: 'user-reply-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-reply-123',
        commentId: 'comment-reply-123',
        owner: 'user-reply-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await replyRepositoryPostgres.deleteReply('reply-reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies by thread id correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-reply-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-reply-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply-123', owner: 'user-reply-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-123',
        threadId: 'thread-reply-123',
        owner: 'user-reply-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-reply-456',
        threadId: 'thread-reply-123',
        owner: 'user-reply-456',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-reply-123',
        commentId: 'comment-reply-123',
        owner: 'user-reply-456',
        content: 'balasan pertama',
        date: '2021-08-08T07:23:33.555Z',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-reply-456',
        commentId: 'comment-reply-123',
        owner: 'user-reply-123',
        content: 'balasan kedua',
        date: '2021-08-08T07:24:33.555Z',
        isDelete: true,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-reply-123');

      expect(replies).toEqual([
        {
          id: 'reply-reply-123',
          commentId: 'comment-reply-123',
          content: 'balasan pertama',
          date: new Date('2021-08-08T07:23:33.555Z'),
          username: 'johndoe',
          isDelete: false,
        },
        {
          id: 'reply-reply-456',
          commentId: 'comment-reply-123',
          content: 'balasan kedua',
          date: new Date('2021-08-08T07:24:33.555Z'),
          username: 'dicoding',
          isDelete: true,
        },
      ]);
    });
  });
});
