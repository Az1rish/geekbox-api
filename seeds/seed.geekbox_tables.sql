BEGIN;

TRUNCATE
    geekbox_users,
    geekbox_categories,
    geekbox_resources,
    geekbox_comments
    RESTART IDENTITY CASCADE;

INSERT INTO geekbox_users (first_name, last_name, user_name, password) VALUES 
    (),