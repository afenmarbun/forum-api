import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import CommentLikeRepository from '../../../Domains/comment_likes/CommentLikeRepository.js';
import ToggleCommentLikeUseCase from '../ToggleCommentLikeUseCase.js';

describe('ToggleCommentLikeUseCase', () => {
  it('should orchestrating the add comment like action correctly when comment is not liked yet', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.resolve());
    mockCommentLikeRepository.isCommentLiked = vi.fn(() => Promise.resolve(false));
    mockCommentLikeRepository.addCommentLike = vi.fn(() => Promise.resolve());
    mockCommentLikeRepository.deleteCommentLike = vi.fn(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await toggleCommentLikeUseCase.execute(owner, threadId, commentId);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(threadId, commentId);
    expect(mockCommentLikeRepository.isCommentLiked).toBeCalledWith(commentId, owner);
    expect(mockCommentLikeRepository.addCommentLike).toBeCalledWith(commentId, owner);
    expect(mockCommentLikeRepository.deleteCommentLike).not.toBeCalled();
  });

  it('should orchestrating the delete comment like action correctly when comment is already liked', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.resolve());
    mockCommentLikeRepository.isCommentLiked = vi.fn(() => Promise.resolve(true));
    mockCommentLikeRepository.addCommentLike = vi.fn(() => Promise.resolve());
    mockCommentLikeRepository.deleteCommentLike = vi.fn(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await toggleCommentLikeUseCase.execute(owner, threadId, commentId);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(threadId, commentId);
    expect(mockCommentLikeRepository.isCommentLiked).toBeCalledWith(commentId, owner);
    expect(mockCommentLikeRepository.deleteCommentLike).toBeCalledWith(commentId, owner);
    expect(mockCommentLikeRepository.addCommentLike).not.toBeCalled();
  });

  it('should propagate error when thread verification fails', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.reject(new Error('THREAD.NOT_FOUND')));
    mockCommentRepository.verifyCommentExists = vi.fn();
    mockCommentLikeRepository.isCommentLiked = vi.fn();
    mockCommentLikeRepository.addCommentLike = vi.fn();
    mockCommentLikeRepository.deleteCommentLike = vi.fn();

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await expect(toggleCommentLikeUseCase.execute(owner, threadId, commentId))
      .rejects
      .toThrowError('THREAD.NOT_FOUND');
    expect(mockCommentRepository.verifyCommentExists).not.toBeCalled();
    expect(mockCommentLikeRepository.isCommentLiked).not.toBeCalled();
    expect(mockCommentLikeRepository.addCommentLike).not.toBeCalled();
    expect(mockCommentLikeRepository.deleteCommentLike).not.toBeCalled();
  });

  it('should propagate error when comment verification fails', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.reject(new Error('COMMENT.NOT_FOUND')));
    mockCommentLikeRepository.isCommentLiked = vi.fn();
    mockCommentLikeRepository.addCommentLike = vi.fn();
    mockCommentLikeRepository.deleteCommentLike = vi.fn();

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await expect(toggleCommentLikeUseCase.execute(owner, threadId, commentId))
      .rejects
      .toThrowError('COMMENT.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentLikeRepository.isCommentLiked).not.toBeCalled();
    expect(mockCommentLikeRepository.addCommentLike).not.toBeCalled();
    expect(mockCommentLikeRepository.deleteCommentLike).not.toBeCalled();
  });
});
