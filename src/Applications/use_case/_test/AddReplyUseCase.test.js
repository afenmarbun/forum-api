import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import AddReplyUseCase from '../AddReplyUseCase.js';

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'sebuah balasan',
    };
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.resolve());
    mockReplyRepository.addReply = vi.fn(() => Promise.resolve(new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    })));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const addedReply = await addReplyUseCase.execute(owner, threadId, commentId, useCasePayload);

    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner,
    }));
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(threadId, commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(commentId, owner, new NewReply(useCasePayload));
  });

  it('should propagate error when comment verification fails', async () => {
    const useCasePayload = {
      content: 'sebuah balasan',
    };
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn(() => Promise.reject(new Error('COMMENT.NOT_FOUND')));
    mockReplyRepository.addReply = vi.fn();

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(addReplyUseCase.execute(owner, threadId, commentId, useCasePayload))
      .rejects
      .toThrowError('COMMENT.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(threadId, commentId);
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });
});
