exports.shorthands = undefined;

exports.up = async (pgm) => {
  pgm.dropConstraint("books", "books_author_id_fkey");
  pgm.dropColumn("books", "author_name");
  pgm.alterColumn("books", "author_id", {
    notNull: true,
  });

  pgm.addConstraint("books", "books_author_id_fkey", {
    foreignKeys: {
      columns: "author_id",
      references: "authors(id)",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("books", "books_author_id_fkey");
  pgm.alterColumn("books", "author_id", {
    notNull: false,
  });
  pgm.addColumn("books", {
    author_name: { type: "varchar(255)", notNull: true, default: "Unknown" },
  });
  pgm.addConstraint("books", "books_author_id_fkey", {
    foreignKeys: {
      columns: "author_id",
      references: "users(id)",
      onDelete: "CASCADE",
    },
  });
};
