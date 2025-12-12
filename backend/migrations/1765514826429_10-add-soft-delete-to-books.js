exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("books", {
    deleted_at: {
      type: "timestamp with time zone",
      default: null,
    },
  });

  pgm.createIndex("books", "deleted_at");
};

exports.down = (pgm) => {
  pgm.dropColumns("books", ["deleted_at"]);
};
