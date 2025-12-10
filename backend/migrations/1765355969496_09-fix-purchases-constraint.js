exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.alterColumn("purchases", "book_id", {
    notNull: false,
  });
};

exports.down = (pgm) => {
  pgm.alterColumn("purchases", "book_id", {
    notNull: true,
  });
};
