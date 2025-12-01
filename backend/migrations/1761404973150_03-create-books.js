exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("books", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    author_id: {
      type: "uuid",
      notNull: true,
      references: '"authors"(id)',
      onDelete: "CASCADE",
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    description: {
      type: "text",
      nullable: true,
    },
    cover_image_url: {
      type: "text",
      nullable: true,
    },
    book_file_url: {
      type: "text",
      notNull: true,
    },
    price: {
      type: "numeric(10, 2)",
      notNull: true,
      default: 0.0,
    },
    currency: {
      type: "varchar(3)",
      notNull: true,
      default: "INR",
    },
    featured: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("books", "author_id");

  pgm.addConstraint("books", "books_price_check", "CHECK (price >= 0)");
};

exports.down = (pgm) => {
  pgm.dropConstraint("books", "books_price_check");
  pgm.dropTable("books");
};
