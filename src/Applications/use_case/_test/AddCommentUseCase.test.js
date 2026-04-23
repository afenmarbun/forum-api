import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddCommentUseCase from '../AddCommentUseCase.js';

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'sebuah komentar',
    };
    const owner = 'user-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.addComment = vi.fn(() => Promise.resolve(new AddedComment({
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 'user-123',
    })));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const addedComment = await addCommentUseCase.execute(owner, threadId, useCasePayload);

    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner,
    }));
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(threadId, owner, new NewComment(useCasePayload));
  });

  it('should propagate error when thread verification fails', async () => {
    const useCasePayload = {
      content: 'sebuah komentar',
    };
    const owner = 'user-123';
    const threadId = 'thread-123';
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.reject(new Error('THREAD.NOT_FOUND')));
    mockCommentRepository.addComment = vi.fn();

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(addCommentUseCase.execute(owner, threadId, useCasePayload))
      .rejects
      .toThrowError('THREAD.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).not.toBeCalled();
  });
});
