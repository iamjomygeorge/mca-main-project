exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
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
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("users", [
    "two_factor_enabled",
    "two_factor_otp",
    "two_factor_otp_expiry",
  ]);
};