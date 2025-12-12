exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.alterColumn("purchases", "book_id", {
    notNull: false,
  });
};

exports.down = (pgm) => {
  pgm.sql("DELETE FROM purchases WHERE book_id IS NULL");

  pgm.alterColumn("purchases", "book_id", {
    notNull: true,
  });
};
