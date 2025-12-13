require("dotenv").config();
const { Pool } = require("pg");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DB_SSL_REJECT_UNAUTHORIZED === "false"
      ? { rejectUnauthorized: false }
      : undefined,
});

const CONFIG = {
  USERS: 10000,
  AUTHORS: 500,
  BOOKS_PER_AUTHOR: 5,
  GENRES: [
    "Literary Fiction",
    "Thriller",
    "Mystery",
    "Science Fiction",
    "Fantasy",
    "Romance",
    "Historical Fiction",
    "Biography",
    "Business",
    "Technology",
    "Self-Help",
    "Crime",
  ],
};

const randomDateBetween = (start, end, bias = 1) => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  if (startTime >= endTime) return new Date(startTime);

  const rnd = Math.pow(Math.random(), 1 / bias);

  const randomTime = startTime + rnd * (endTime - startTime);
  return new Date(randomTime);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seed() {
  try {
    const NOW = new Date();
    const COMPANY_START_DATE = new Date("2022-12-15T00:00:00.000Z");

    console.log("[INFO] Starting High-Fidelity Data Simulation...");
    console.log(
      `[INFO] Simulation Window: ${COMPANY_START_DATE.toISOString()} to ${NOW.toISOString()}`
    );

    // 1. Create Simulated Authors
    console.log(`[INFO] Creating ${CONFIG.AUTHORS} Authors...`);
    const authors = [];
    for (let i = 0; i < CONFIG.AUTHORS; i++) {
      const res = await pool.query(
        "INSERT INTO authors (name, is_simulated) VALUES ($1, $2) RETURNING id",
        [faker.person.fullName(), true]
      );
      authors.push(res.rows[0].id);
    }

    // 2. Create Simulated Books
    console.log(
      `[INFO] Creating Books with realistic INR pricing and publication dates...`
    );
    const books = [];

    for (const authorId of authors) {
      const booksThisAuthor = faker.number.int({ min: 1, max: 12 });

      for (let i = 0; i < booksThisAuthor; i++) {
        const genre = faker.helpers.arrayElement(CONFIG.GENRES);
        const pricePoints = [0, 199, 299, 399, 499, 599, 799, 999, 1299, 1499];
        const price = faker.helpers.weightedArrayElement([
          { weight: 15, value: 0 },
          {
            weight: 85,
            value: faker.helpers.arrayElement([
              199, 299, 399, 499, 599, 799, 999, 1299, 1499,
            ]),
          },
        ]);

        const fileHash = faker.string
          .hexadecimal({ length: 64, prefix: "" })
          .toLowerCase();
        const txHash = `0x${faker.string
          .hexadecimal({ length: 64, prefix: "" })
          .toLowerCase()}`;

        // Bias = 1.5 (Slight increase in publication rate over time)
        const publishedAt = randomDateBetween(COMPANY_START_DATE, NOW, 1.5);

        const titleAdjective = faker.word.adjective();
        const titleNoun = faker.word.noun();
        const title =
          Math.random() > 0.5
            ? `${
                titleAdjective.charAt(0).toUpperCase() + titleAdjective.slice(1)
              } ${titleNoun.charAt(0).toUpperCase() + titleNoun.slice(1)}`
            : faker.music.songName();

        const encodedTitle = encodeURIComponent(title);
        const coverImageUrl = `https://placehold.co/400x600/2a2a2a/FFF?text=${encodedTitle}`;
        const pageCount = faker.number.int({ min: 150, max: 850 });

        const res = await pool.query(
          `INSERT INTO books (
            author_id, title, description, book_file_url, cover_image_url, 
            price, currency, genre, page_count, file_hash, blockchain_tx_hash, is_simulated, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
           RETURNING id, genre, price, page_count, created_at`,
          [
            authorId,
            title,
            faker.lorem.paragraphs(2),
            "https://inkling-simulated-content.com/placeholder.epub",
            coverImageUrl,
            price,
            "INR",
            genre,
            pageCount,
            fileHash,
            txHash,
            true,
            publishedAt,
          ]
        );

        // Popularity Score (Pareto)
        const isBestseller = Math.random() < 0.2;
        const popularityScore = isBestseller
          ? faker.number.int({ min: 20, max: 100 })
          : faker.number.int({ min: 1, max: 10 });

        books.push({
          ...res.rows[0],
          popularityScore,
        });
      }
    }

    const booksByGenre = {};
    CONFIG.GENRES.forEach((g) => (booksByGenre[g] = []));
    books.forEach((b) => {
      if (booksByGenre[b.genre]) booksByGenre[b.genre].push(b);
    });

    const pickWeightedBook = (poolOfBooks) => {
      if (!poolOfBooks || poolOfBooks.length === 0) return null;
      const totalWeight = poolOfBooks.reduce(
        (acc, b) => acc + b.popularityScore,
        0
      );
      let random = Math.random() * totalWeight;
      for (const book of poolOfBooks) {
        random -= book.popularityScore;
        if (random <= 0) return book;
      }
      return poolOfBooks[0];
    };

    // 3. Create Users & Activity
    console.log(`[INFO] Creating ${CONFIG.USERS} Users...`);
    const passwordHash = await bcrypt.hash("password123", 10);

    // Reduced batch size to 1 to prevent connection termination
    const BATCH_SIZE = 1;

    for (let i = 0; i < CONFIG.USERS; i += BATCH_SIZE) {
      const userBatchPromises = [];

      for (let j = 0; j < BATCH_SIZE; j++) {
        if (i + j >= CONFIG.USERS) break;

        userBatchPromises.push(
          (async () => {
            try {
              const email = `simulated_user_${i + j}@inkling.test`;
              const signupDate = randomDateBetween(COMPANY_START_DATE, NOW, 4);

              const userRes = await pool.query(
                `INSERT INTO users (full_name, email, password_hash, role, auth_method, is_simulated, created_at)
             VALUES ($1, $2, $3, 'READER', 'email', $4, $5) RETURNING id`,
                [faker.person.fullName(), email, passwordHash, true, signupDate]
              );
              const userId = userRes.rows[0].id;

              //Sensitivity, User Type
              const sensitivityRoll = Math.random();
              const priceSensitivity =
                sensitivityRoll < 0.5
                  ? "BUDGET"
                  : sensitivityRoll < 0.9
                  ? "MODERATE"
                  : "PREMIUM";

              // Reading Speed
              const readingSpeed = faker.number.float({
                min: 0.5,
                max: 3.0,
                precision: 0.1,
              });

              // Churn Simulated
              const willChurn = Math.random() < 0.25;
              let churnDate = null;
              if (willChurn) {
                churnDate = randomDateBetween(signupDate, NOW, 1);
              }

              const isWhale = Math.random() < 0.1;
              const purchaseCount = isWhale
                ? faker.number.int({ min: 15, max: 45 })
                : faker.number.int({ min: 1, max: 6 });

              const preferredGenre = faker.helpers.arrayElement(CONFIG.GENRES);

              for (let k = 0; k < purchaseCount; k++) {
                const isPreferred = Math.random() < 0.7;
                const targetPool = isPreferred
                  ? booksByGenre[preferredGenre]
                  : books;
                let book = pickWeightedBook(targetPool);
                if (!book) continue;

                if (book.price === 0) {
                } else {
                  if (priceSensitivity === "BUDGET") {
                    // High rejection for paid books if Budget user
                    // If > 499, 95% reject. If > 0, 60% reject.
                    if (book.price > 499) {
                      if (Math.random() < 0.95) continue;
                    } else {
                      if (Math.random() < 0.6) continue;
                    }
                  }
                  if (priceSensitivity === "MODERATE" && book.price > 999) {
                    if (Math.random() < 0.7) continue;
                  }
                }

                const bookPublishedTime = new Date(book.created_at).getTime();
                const userJoinedTime = signupDate.getTime();
                const earliestPurchaseTime = Math.max(
                  bookPublishedTime,
                  userJoinedTime
                );
                const earliestPurchaseDate = new Date(earliestPurchaseTime);

                if (earliestPurchaseDate >= NOW) continue;

                if (
                  willChurn &&
                  earliestPurchaseDate.getTime() > churnDate.getTime()
                )
                  continue;

                let maxDate = willChurn ? churnDate : NOW;
                if (earliestPurchaseDate >= maxDate) continue;

                // Seasonality
                let purchaseDate = randomDateBetween(
                  earliestPurchaseDate,
                  maxDate,
                  1.2
                );
                const month = purchaseDate.getMonth();
                if (month !== 10 && month !== 11) {
                  if (Math.random() < 0.3)
                    purchaseDate = randomDateBetween(
                      purchaseDate,
                      maxDate,
                      1.5
                    );
                }

                if (Number(book.price) > 0 && Math.random() < 0.03) {
                  // Record failed transaction
                  await pool.query(
                    `INSERT INTO purchases (
                    user_id, book_id, purchase_price, purchase_currency, status, 
                    platform_fee, author_revenue, transaction_id, created_at, updated_at, is_simulated
                  ) VALUES ($1, $2, $3, 'INR', 'FAILED', 0, 0, $4, $5, $5, $6)`,
                    [
                      userId,
                      book.id,
                      book.price,
                      `sim_fail_${faker.string.alphanumeric(12)}`,
                      purchaseDate,
                      true,
                    ]
                  );
                  continue;
                }

                await pool.query(
                  `INSERT INTO purchases (
                user_id, book_id, purchase_price, purchase_currency, status, 
                platform_fee, author_revenue, transaction_id, created_at, updated_at, is_simulated
              ) VALUES ($1, $2, $3, 'INR', 'COMPLETED', $4, $5, $6, $7, $7, $8)`,
                  [
                    userId,
                    book.id,
                    book.price,
                    (book.price * 0.1).toFixed(2),
                    (book.price * 0.9).toFixed(2),
                    `sim_tx_${faker.string.alphanumeric(12)}`,
                    purchaseDate,
                    true,
                  ]
                );

                await pool.query(
                  `INSERT INTO user_library (user_id, book_id, added_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                  [userId, book.id, purchaseDate]
                );

                // D. Simulated Reading Sessions
                if (purchaseDate >= maxDate) continue;

                // Determine Final Progress
                let finalProgress = isPreferred ? 80 : 30;
                if (priceSensitivity === "BUDGET" && book.price > 599)
                  finalProgress += 10;
                finalProgress += faker.number.int({ min: -20, max: 20 });
                if (finalProgress > 100) finalProgress = 100;
                if (finalProgress < 0) finalProgress = 0;

                // Break into sessions (1 to 5)
                const sessions = faker.number.int({ min: 1, max: 5 });
                let currentProgress = 0;
                let sessionDate = new Date(
                  purchaseDate.getTime() + 1000 * 60 * 60
                );

                for (let s = 0; s < sessions; s++) {
                  if (sessionDate >= maxDate) break;
                  if (currentProgress >= finalProgress) break;

                  // Progress for this session
                  const remaining = finalProgress - currentProgress;
                  const sessionGain = Math.ceil(remaining / (sessions - s));
                  const nextProgress = currentProgress + sessionGain;

                  // Duration calculation based on pages read * reading speed
                  const pagesInBook = book.page_count;
                  const pagesRead = Math.ceil(
                    (sessionGain / 100) * pagesInBook
                  );
                  // speed = pages/min. minutes = pages / speed. seconds = minutes * 60
                  const durationSeconds = Math.ceil(
                    (pagesRead / readingSpeed) * 60
                  );

                  await pool.query(
                    `INSERT INTO reading_activity (user_id, book_id, session_start, duration_seconds, progress_percentage, is_simulated)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                      userId,
                      book.id,
                      sessionDate,
                      durationSeconds,
                      nextProgress,
                      true,
                    ]
                  );

                  currentProgress = nextProgress;
                  sessionDate = new Date(
                    sessionDate.getTime() +
                      faker.number.int({ min: 86400000, max: 259200000 })
                  );
                }

                // E. Simulate Review
                if (finalProgress > 30) {
                  const timeForReview = sessionDate.getTime() + 1000 * 60 * 60;
                  if (timeForReview < maxDate.getTime()) {
                    const reviewDate = randomDateBetween(
                      new Date(timeForReview),
                      maxDate
                    );

                    let rating;
                    if (finalProgress >= 90)
                      rating = faker.helpers.weightedArrayElement([
                        { weight: 70, value: 5 },
                        { weight: 20, value: 4 },
                        { weight: 10, value: 3 },
                      ]);
                    else if (finalProgress >= 60)
                      rating = faker.helpers.weightedArrayElement([
                        { weight: 50, value: 4 },
                        { weight: 30, value: 3 },
                        { weight: 20, value: 5 },
                      ]);
                    else
                      rating = faker.helpers.weightedArrayElement([
                        { weight: 50, value: 3 },
                        { weight: 30, value: 2 },
                        { weight: 20, value: 1 },
                      ]);

                    let comment;
                    if (rating >= 4)
                      comment =
                        faker.helpers.arrayElement([
                          "Absolutely loved it!",
                          "A masterpiece.",
                          "Highly recommended read.",
                          "Couldn't put it down.",
                        ]) +
                        " " +
                        faker.lorem.sentence();
                    else if (rating === 3)
                      comment =
                        "It was okay, but had some pacing issues. " +
                        faker.lorem.sentence();
                    else
                      comment =
                        "Not my cup of tea. Disappointing. " +
                        faker.lorem.sentence();

                    await pool.query(
                      `INSERT INTO reviews (user_id, book_id, rating, comment, created_at, is_simulated)
                          VALUES ($1, $2, $3, $4, $5, $6)`,
                      [userId, book.id, rating, comment, reviewDate, true]
                    );
                  }
                }
              }
            } catch (err) {
              console.warn(
                `[WARN] Failed to seed simulated user: ${err.message}`
              );
            }
          })()
        );
      }
      await Promise.all(userBatchPromises);
      process.stdout.write(
        `\r[INFO] Progress: ${Math.min(i + BATCH_SIZE, CONFIG.USERS)}/${
          CONFIG.USERS
        } users created`
      );
      // Throttle to prevent overwhelming the DB connection pool
      await wait(50);
    }

    console.log(
      "\n[SUCCESS] Database populated successfully with high-fidelity analytics data!"
    );
  } catch (err) {
    console.error("\n[ERROR] Seeding Failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
