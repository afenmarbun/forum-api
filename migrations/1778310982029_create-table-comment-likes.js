export const up = (pgm) => {
  pgm.createTable('comment_likes', {
    'comment_id': {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint(
    'comment_likes',
    'comment_likes_pkey',
    'PRIMARY KEY(comment_id, owner)',
  );
};

export const down = (pgm) => {
  pgm.dropTable('comment_likes');
};
