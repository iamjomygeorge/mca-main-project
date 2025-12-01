exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType("contact_status", ["NEW", "READ", "RESOLVED"]);

  pgm.createTable("contact_messages", {
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
    },
    full_name: {
      type: "varchar(255)",
      notNull: true,
    },
    email: {
      type: "text",
      notNull: true,
    },
    message: {
      type: "text",
      notNull: true,
    },
    status: {
      type: "contact_status",
      notNull: true,
      default: "NEW",
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("contact_messages", "status");
  pgm.createIndex("contact_messages", "email");
  pgm.createIndex("contact_messages", "user_id");
};

exports.down = (pgm) => {
  pgm.dropTable("contact_messages");
  pgm.dropType("contact_status");
};
