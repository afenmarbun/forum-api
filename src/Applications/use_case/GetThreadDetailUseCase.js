class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const mappedReplies = replies.reduce((acc, reply) => {
      const normalizedReply = {
        id: reply.id,
        content: reply.isDelete ? '**balasan telah dihapus**' : reply.content,
        date: reply.date,
        username: reply.username,
      };

      if (!acc[reply.commentId]) {
        acc[reply.commentId] = [];
      }

      acc[reply.commentId].push(normalizedReply);
      return acc;
    }, {});

    Object.keys(mappedReplies).forEach((commentId) => {
      mappedReplies[commentId].sort((firstReply, secondReply) => (
        new Date(firstReply.date) - new Date(secondReply.date)
      ));
    });

    return {
      ...thread,
      comments: comments
        .slice()
        .sort((firstComment, secondComment) => (
          new Date(firstComment.date) - new Date(secondComment.date)
        ))
        .map((comment) => ({
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.isDelete ? '**komentar telah dihapus**' : comment.content,
          likeCount: Number(comment.likeCount || 0),
          replies: mappedReplies[comment.id] || [],
        })),
    };
  }
}

export default GetThreadDetailUseCase;
