import NewReply from '../../Domains/replies/entities/NewReply.js';

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(owner, threadId, commentId, useCasePayload) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(threadId, commentId);

    const newReply = new NewReply(useCasePayload);

    return this._replyRepository.addReply(commentId, owner, newReply);
  }
}

export default AddReplyUseCase;
