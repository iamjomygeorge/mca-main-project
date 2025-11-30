exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType("payment_status", ["PENDING", "COMPLETED", "FAILED"]);

  pgm.createTable("purchases", {
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
      onDelete: "SET NULL",
    },
    purchase_price: { type: "numeric(10, 2)", notNull: true },
    purchase_currency: { type: "varchar(3)", notNull: true },
    transaction_id: { type: "text", nullable: true },
    status: {
      type: "payment_status",
      notNull: true,
      default: "PENDING",
    },
    platform_fee: { type: "numeric(10, 2)", notNull: true },
    author_revenue: { type: "numeric(10, 2)", notNull: true },
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

  pgm.createIndex("purchases", "user_id");
  pgm.createIndex("purchases", "book_id");
  pgm.createIndex("purchases", "status");

  pgm.createTable(
    "user_library",
    {
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
      added_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    },
    {
      constraints: {
        primaryKey: ["user_id", "book_id"],
      },
    }
  );
};

exports.down = (pgm) => {
  pgm.dropTable("user_library");
  pgm.dropTable("purchases");
  pgm.dropType("payment_status");
};