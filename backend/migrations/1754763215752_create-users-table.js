exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });
  pgm.createType('user_role', ['READER', 'AUTHOR', 'ADMIN']);
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    full_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    email: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    username: {
      type: 'varchar(50)',
      notNull: false,
      unique: true,
    },
    password_hash: {
      type: 'text',
      notNull: true,
    },
    role: {
      type: 'user_role',
      notNull: true,
      default: 'READER',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
  pgm.dropType('user_role');
};