import CommentLikeRepository from '../../Domains/comment_likes/CommentLikeRepository.js';

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async addCommentLike(commentId, owner) {
    const query = {
      text: `INSERT INTO comment_likes(comment_id, owner)
        VALUES($1, $2)
        ON CONFLICT(comment_id, owner) DO NOTHING`,
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteCommentLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async isCommentLiked(commentId, owner) {
    const query = {
      text: 'SELECT comment_id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }
}

export default CommentLikeRepositoryPostgres;
