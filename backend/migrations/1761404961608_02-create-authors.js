exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("authors", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    user_id: {
      type: "uuid",
      notNull: false,
      references: '"users"(id)',
      onDelete: "SET NULL",
      unique: true,
    },
    name: {
      type: "varchar(255)",
      notNull: true,
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