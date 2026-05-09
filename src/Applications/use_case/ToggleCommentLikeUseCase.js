class ToggleCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(owner, threadId, commentId) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(threadId, commentId);

    const isCommentLiked = await this._commentLikeRepository.isCommentLiked(commentId, owner);

    if (isCommentLiked) {
      await this._commentLikeRepository.deleteCommentLike(commentId, owner);
      return;
    }

    await this._commentLikeRepository.addCommentLike(commentId, owner);
  }
}

export default ToggleCommentLikeUseCase;
