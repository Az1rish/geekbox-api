CREATE TABLE geekbox_categories (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    user_id INTEGER REFERENCES geekbox_users(id) ON DELETE CASCADE NOT NULL
);
