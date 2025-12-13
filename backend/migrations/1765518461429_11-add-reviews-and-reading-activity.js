exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
    is_simulated: { type: "boolean", notNull: true, default: false },
  });
  pgm.addColumns("authors", {
    is_simulated: { type: "boolean", notNull: true, default: false },
  });
  pgm.addColumns("purchases", {
    is_simulated: { type: "boolean", notNull: true, default: false },
  });

  pgm.addColumns("books", {
    genre: { type: "varchar(50)", notNull: false },
    page_count: { type: "integer", notNull: true, default: 300 },
    is_simulated: { type: "boolean", notNull: true, default: false },
  });

  pgm.createTable("reviews", {
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
    book_id: {
      type: "uuid",
      notNull: true,
      references: '"books"(id)',
      onDelete: "CASCADE",
    },
    rating: {
      type: "integer",
      notNull: true,
      check: "rating >= 1 AND rating <= 5",
    },
    comment: { type: "text" },
    is_simulated: { type: "boolean", notNull: true, default: false },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("reviews", "book_id");
  pgm.createIndex("reviews", "user_id");
  pgm.createIndex("reviews", "is_simulated");

  pgm.createTable("reading_activity", {
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
    book_id: {
      type: "uuid",
      notNull: true,
      references: '"books"(id)',
      onDelete: "CASCADE",
    },
    session_start: { type: "timestamp with time zone", notNull: true },
    duration_seconds: { type: "integer", notNull: true },
    progress_percentage: { type: "integer", notNull: true },
    is_simulated: { type: "boolean", notNull: true, default: false },
  });

  pgm.createIndex("reading_activity", ["user_id", "book_id"]);
  pgm.createIndex("reading_activity", "is_simulated");
};

exports.down = (pgm) => {
  pgm.dropTable("reading_activity");
  pgm.dropTable("reviews");
  pgm.dropColumns("books", ["genre", "page_count", "is_simulated"]);
  pgm.dropColumns("users", ["is_simulated"]);
  pgm.dropColumns("authors", ["is_simulated"]);
  pgm.dropColumns("purchases", ["is_simulated"]);
};
