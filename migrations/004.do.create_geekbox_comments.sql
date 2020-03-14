CREATE TABLE geekbox_comments (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    rating INTEGER NOT NULL,
    resource_id INTEGER REFERENCES geekbox_resources(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES geekbox_users(id) ON DELETE CASCADE NOT NULL
);