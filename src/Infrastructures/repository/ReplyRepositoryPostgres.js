import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(commentId, owner, newReply) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, commentId, owner, new Date(), false],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async verifyReplyExists(commentId, replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE comment_id = $1 AND id = $2',
      values: [commentId, replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount || result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2',
      values: [true, replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.comment_id AS "commentId", replies.content,
          replies.date, replies.is_delete AS "isDelete", users.username
        FROM replies
        JOIN comments ON comments.id = replies.comment_id
        JOIN users ON users.id = replies.owner
        WHERE comments.thread_id = $1
        ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

export default ReplyRepositoryPostgres;
