exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("refresh_tokens", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"(id)',
      onDelete: "CASCADE",
    },
    token_hash: {
      type: "text",
      notNull: true,
    },
    expires_at: {
      type: "timestamp with time zone",
      notNull: true,
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    ip_address: {
      type: "inet",
      nullable: true,
    },
    user_agent: {
      type: "text",
      nullable: true,
    },
  });

  pgm.createIndex("refresh_tokens", "token_hash");
  pgm.createIndex("refresh_tokens", "user_id");
};

exports.down = (pgm) => {
  pgm.dropTable("refresh_tokens");
};
