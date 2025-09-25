exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("books", {
    featured: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("books", ["featured"]);
};
