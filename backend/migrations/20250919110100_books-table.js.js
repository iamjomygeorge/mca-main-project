exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('books', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    author_id: {
      type: 'uuid',
      notNull: false,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    author_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    cover_image_url: {
      type: 'text',
    },
    book_file_url: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('books');
};