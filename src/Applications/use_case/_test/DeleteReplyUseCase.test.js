import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = vi.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = vi.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = vi.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await deleteReplyUseCase.execute(owner, threadId, commentId, replyId);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(threadId, commentId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(commentId, replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);
  });

  it('should propagate error when reply owner verification fails', async () => {
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = vi.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = vi.fn(() => Promise.reject(new Error('REPLY.NOT_OWNER')));
    mockReplyRepository.deleteReply = vi.fn();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(deleteReplyUseCase.execute(owner, threadId, commentId, replyId))
      .rejects
      .toThrowError('REPLY.NOT_OWNER');
    expect(mockReplyRepository.deleteReply).not.toBeCalled();
  });
});
