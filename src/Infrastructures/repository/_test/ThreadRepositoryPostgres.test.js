import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread('user-123', newThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread('user-123', newThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread detail correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const date = '2021-08-08T07:19:09.775Z';
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
        date,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread).toEqual({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date(date),
        username: 'dicoding',
      });
    });
  });
});
