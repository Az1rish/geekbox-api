CREATE TABLE geekbox_resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    category_id INTEGER REFERENCES geekbox_categories(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES geekbox_users(id) ON DELETE CASCADE NOT NULL
);