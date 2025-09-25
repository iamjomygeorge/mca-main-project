exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("authors", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: {
      type: "varchar(255)",
      notNull: true,
    },
    user_id: {
      type: "uuid",
      references: '"users"(id)',
      onDelete: "SET NULL",
      unique: true,
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("authors");
};
