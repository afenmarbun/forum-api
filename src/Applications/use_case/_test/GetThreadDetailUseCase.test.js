import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    const threadId = 'thread-123';
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi.fn(() => Promise.resolve({
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    }));
    mockCommentRepository.getCommentsByThreadId = vi.fn(() => Promise.resolve([
      {
        id: 'comment-222',
        username: 'johndoe',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komentar kedua',
        likeCount: 0,
        isDelete: true,
      },
      {
        id: 'comment-111',
        username: 'dicoding',
        date: '2021-08-08T07:22:33.555Z',
        content: 'komentar pertama',
        likeCount: 2,
        isDelete: false,
      },
    ]));
    mockReplyRepository.getRepliesByThreadId = vi.fn(() => Promise.resolve([
      {
        id: 'reply-111',
        commentId: 'comment-111',
        content: 'balasan pertama',
        date: '2021-08-08T07:23:33.555Z',
        username: 'johndoe',
        isDelete: false,
      },
      {
        id: 'reply-222',
        commentId: 'comment-111',
        content: 'balasan kedua',
        date: '2021-08-08T07:24:33.555Z',
        username: 'dicoding',
        isDelete: true,
      },
    ]));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await getThreadDetailUseCase.execute(threadId);

    expect(thread).toStrictEqual({
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-111',
          username: 'dicoding',
          date: '2021-08-08T07:22:33.555Z',
          content: 'komentar pertama',
          likeCount: 2,
          replies: [
            {
              id: 'reply-111',
              content: 'balasan pertama',
              date: '2021-08-08T07:23:33.555Z',
              username: 'johndoe',
            },
            {
              id: 'reply-222',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T07:24:33.555Z',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-222',
          username: 'johndoe',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);
  });

  it('should propagate error when thread is not found', async () => {
    const threadId = 'thread-123';
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi.fn(() => Promise.reject(new Error('THREAD.NOT_FOUND')));
    mockCommentRepository.getCommentsByThreadId = vi.fn();
    mockReplyRepository.getRepliesByThreadId = vi.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(getThreadDetailUseCase.execute(threadId))
      .rejects
      .toThrowError('THREAD.NOT_FOUND');
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
    expect(mockReplyRepository.getRepliesByThreadId).not.toBeCalled();
  });
});
