exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  pgm.createType("user_role", ["READER", "AUTHOR", "ADMIN"]);
  pgm.createType("auth_method_type", ["email", "google"]);

  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    full_name: {
      type: "varchar(255)",
      notNull: true,
    },
    email: {
      type: "text",
      notNull: true,
      unique: true,
    },
    username: {
      type: "varchar(50)",
      notNull: false,
      unique: true,
    },
    password_hash: {
      type: "text",
      notNull: false,
    },
    role: {
      type: "user_role",
      notNull: true,
      default: "READER",
    },
    auth_method: {
      type: "auth_method_type",
      notNull: true,
      default: "email",
    },
    google_id: {
      type: "text",
      nullable: true,
      unique: true,
    },
    two_factor_enabled: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    two_factor_otp: {
      type: "text",
      nullable: true,
    },
    two_factor_otp_expiry: {
      type: "timestamp with time zone",
      nullable: true,
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("users");
  pgm.dropType("auth_method_type");
  pgm.dropType("user_role");
};
