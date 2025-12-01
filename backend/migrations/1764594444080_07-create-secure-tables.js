exports.shorthands = undefined;

exports.up = (pgm) => {
  const tables = [
    "users",
    "authors",
    "books",
    "purchases",
    "user_library",
    "contact_messages",
    "refresh_tokens",
    "pgmigrations",
  ];

  tables.forEach((table) => {
    pgm.sql(`ALTER TABLE IF EXISTS "${table}" ENABLE ROW LEVEL SECURITY;`);
  });
};

exports.down = (pgm) => {
  const tables = [
    "users",
    "authors",
    "books",
    "purchases",
    "user_library",
    "contact_messages",
    "refresh_tokens",
    "pgmigrations",
  ];

  tables.forEach((table) => {
    pgm.sql(`ALTER TABLE IF EXISTS "${table}" DISABLE ROW LEVEL SECURITY;`);
  });
};
