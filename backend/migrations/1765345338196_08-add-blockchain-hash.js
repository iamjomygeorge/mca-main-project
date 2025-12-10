exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("books", {
    blockchain_tx_hash: {
      type: "text",
      nullable: true,
    },

    file_hash: {
      type: "text",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("books", ["blockchain_tx_hash", "file_hash"]);
};
