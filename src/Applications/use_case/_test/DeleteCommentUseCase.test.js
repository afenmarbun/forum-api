import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = vi.fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = vi.fn(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await deleteCommentUseCase.execute(owner, threadId, commentId);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(threadId, commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });

  it('should propagate error when comment owner verification fails', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = vi.fn(() => Promise.reject(new Error('COMMENT.NOT_OWNER')));
    mockCommentRepository.deleteComment = vi.fn();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(deleteCommentUseCase.execute(owner, threadId, commentId))
      .rejects
      .toThrowError('COMMENT.NOT_OWNER');
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });
});
