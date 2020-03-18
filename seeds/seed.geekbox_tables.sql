BEGIN;

TRUNCATE
    geekbox_users,
    geekbox_categories,
    geekbox_resources,
    geekbox_comments
    RESTART IDENTITY CASCADE;

INSERT INTO geekbox_users (first_name, last_name, user_name, password) VALUES 
    ('Shane', 'McNeil', 'Az1rish', 'password'),
    ('John', 'Doe', 'JohnnyBoy', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1ODQ0NzMzNTUsInN1YiI6IlRlc3QgVXNlciAxIn0.B9pJ7AG8mS6bOeXi_3niwQEAxe17wdzOmMIfwiP12LA'),
    ('Effie', 'McNeil', 'Epang120', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1ODQ0NzMzNTUsInN1YiI6IlRlc3QgVXNlciAxIn0.B9pJ7AG8mS6bOeXi_3niwQEAxe17wdzOmMIfwiP12LA'),
    ('Dee', 'Hammann', 'Ammie55', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1ODQ0NzMzNTUsInN1YiI6IlRlc3QgVXNlciAxIn0.B9pJ7AG8mS6bOeXi_3niwQEAxe17wdzOmMIfwiP12LA');

INSERT INTO geekbox_categories (title, user_id) VALUES 
    ('JavaScript', 1),
    ('Languages', 2),
    ('Gardening', 3),
    ('Poker', 4);

INSERT INTO geekbox_resources (title, url, description, category_id, user_id) VALUES 
    ('Udemy', 'https://www.udemy.com/', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum molestiae accusamus veniam consectetur tempora, corporis obcaecati ad nisi asperiores tenetur, autem magnam. Iste, architecto obcaecati tenetur quidem voluptatum ipsa quam?', 1, 4),
    ('Duolingo', 'https://www.Duolingo.com/', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum molestiae accusamus veniam consectetur tempora, corporis obcaecati ad nisi asperiores tenetur, autem magnam. Iste, architecto obcaecati tenetur quidem voluptatum ipsa quam?', 2, 3),
    ('Gardening 101', 'https://greatist.com/connect/beginners-guide-to-gardening#1', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum molestiae accusamus veniam consectetur tempora, corporis obcaecati ad nisi asperiores tenetur, autem magnam. Iste, architecto obcaecati tenetur quidem voluptatum ipsa quam?', 3, 2),
    ('Instructables', 'https://www.instructables.com/id/Learn-How-to-Play-Poker!/', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum molestiae accusamus veniam consectetur tempora, corporis obcaecati ad nisi asperiores tenetur, autem magnam. Iste, architecto obcaecati tenetur quidem voluptatum ipsa quam?', 4, 1);

INSERT INTO geekbox_comments (comment, rating, resource_id, user_id) VALUES 
    ('Pok pok air plant post-ironic vexillologist subway tile adaptogen. Keytar small batch sriracha dreamcatcher.', 5, 4, 3),
    ('Pok pok air plant post-ironic vexillologist subway tile adaptogen. Keytar small batch sriracha dreamcatcher.', 4, 3, 2),
    ('Pok pok air plant post-ironic vexillologist subway tile adaptogen. Keytar small batch sriracha dreamcatcher.', 3, 2, 1),
    ('Pok pok air plant post-ironic vexillologist subway tile adaptogen. Keytar small batch sriracha dreamcatcher.', 2, 1, 4);

COMMIT;