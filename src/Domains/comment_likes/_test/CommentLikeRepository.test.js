import CommentLikeRepository from '../CommentLikeRepository.js';

describe('CommentLikeRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const commentLikeRepository = new CommentLikeRepository();

    await expect(commentLikeRepository.addCommentLike('', '')).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikeRepository.deleteCommentLike('', '')).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikeRepository.isCommentLiked('', '')).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
